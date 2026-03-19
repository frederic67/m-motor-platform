import time
import traceback
from typing import Callable, Optional
from uuid import UUID
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from app.core.logging import logger
from app.core.alerting import alert_manager


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log all HTTP requests with timing and user information.
    
    Logs:
    - Request method, path, and query parameters
    - Response status code
    - Request duration in milliseconds
    - User ID if authenticated
    - Client IP address
    
    Triggers alerts for:
    - Unhandled exceptions
    - HTTP 500+ responses
    """
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and log details.
        
        Args:
            request: Incoming HTTP request
            call_next: Next middleware/route handler
            
        Returns:
            HTTP response
        """
        # Start timing
        start_time = time.time()
        
        # Extract request details
        method = request.method
        path = request.url.path
        query_params = str(request.query_params) if request.query_params else None
        client_ip = request.client.host if request.client else None
        
        # Extract user ID if available (from request state set by auth dependency)
        user_id: Optional[UUID] = None
        try:
            if hasattr(request.state, "user"):
                user_id = request.state.user.id
        except:
            pass
        
        # Process request
        response: Optional[Response] = None
        exception_occurred = False
        
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            exception_occurred = True
            # Log exception with full traceback
            duration_ms = (time.time() - start_time) * 1000
            
            logger.error(
                f"Request failed: {method} {path}",
                extra={
                    "extra_data": {
                        "method": method,
                        "path": path,
                        "query_params": query_params,
                        "duration_ms": round(duration_ms, 2),
                        "user_id": str(user_id) if user_id else None,
                        "client_ip": client_ip,
                        "exception_type": type(exc).__name__,
                        "exception_message": str(exc),
                        "traceback": traceback.format_exc()
                    }
                },
                exc_info=True
            )
            
            # Trigger alert for unhandled exception
            alert_manager.alert_unhandled_exception(
                exception=exc,
                method=method,
                path=path,
                user_id=str(user_id) if user_id else None,
                client_ip=client_ip,
                duration_ms=round(duration_ms, 2),
                query_params=query_params
            )
            
            # Re-raise exception to let FastAPI handle it
            raise
        finally:
            # Log request completion
            if response is not None and not exception_occurred:
                duration_ms = (time.time() - start_time) * 1000
                status_code = response.status_code
                
                # Determine log level based on status code
                if status_code >= 500:
                    log_level = "error"
                    
                    # Trigger alert for 500+ responses
                    alert_manager.alert_http_500(
                        method=method,
                        path=path,
                        status_code=status_code,
                        duration_ms=round(duration_ms, 2),
                        user_id=str(user_id) if user_id else None,
                        client_ip=client_ip,
                        query_params=query_params
                    )
                elif status_code >= 400:
                    log_level = "warning"
                else:
                    log_level = "info"
                
                log_func = getattr(logger, log_level)
                log_func(
                    f"{method} {path} - {status_code}",
                    extra={
                        "extra_data": {
                            "method": method,
                            "path": path,
                            "query_params": query_params,
                            "status_code": status_code,
                            "duration_ms": round(duration_ms, 2),
                            "user_id": str(user_id) if user_id else None,
                            "client_ip": client_ip
                        }
                    }
                )
