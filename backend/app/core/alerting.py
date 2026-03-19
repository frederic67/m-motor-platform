import logging
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from app.core.logging import logger


class AlertManager:
    """
    Alert manager for critical events.
    Logs to separate alert file and provides email notification placeholder.
    """
    
    def __init__(self):
        """Initialize alert manager with dedicated logger and handler."""
        self._setup_alert_logger()
    
    def _setup_alert_logger(self):
        """Setup dedicated logger for alerts."""
        # Create logs directory
        Path("logs").mkdir(exist_ok=True)
        
        # Create dedicated alert logger
        self.alert_logger = logging.getLogger("m-motor-alerts")
        self.alert_logger.setLevel(logging.WARNING)
        self.alert_logger.handlers.clear()
        
        # File handler for alerts only
        alert_handler = logging.FileHandler("logs/alerts.log", encoding="utf-8")
        alert_handler.setLevel(logging.WARNING)
        
        # JSON formatter for alerts
        alert_formatter = AlertFormatter()
        alert_handler.setFormatter(alert_formatter)
        
        self.alert_logger.addHandler(alert_handler)
        self.alert_logger.propagate = False
    
    def trigger_alert(
        self,
        alert_type: str,
        message: str,
        severity: str = "critical",
        context: Optional[Dict[str, Any]] = None
    ):
        """
        Trigger an alert for critical events.
        
        Args:
            alert_type: Type of alert (e.g., "unhandled_exception", "http_500")
            message: Alert message
            severity: Severity level (critical, high, medium, low)
            context: Additional context data
        """
        alert_data = {
            "alert_type": alert_type,
            "message": message,
            "severity": severity,
            "context": context or {}
        }
        
        # Log to alerts file
        self.alert_logger.critical(
            f"[ALERT] {alert_type}: {message}",
            extra={"alert_data": alert_data}
        )
        
        # Log to main logger as well
        logger.critical(
            f"Alert triggered: {alert_type}",
            extra={"extra_data": alert_data}
        )
        
        # Send email notification (placeholder)
        self._send_email_notification(alert_data)
    
    def _send_email_notification(self, alert_data: Dict[str, Any]):
        """
        Send email notification for alert.
        This is a placeholder implementation.
        
        Args:
            alert_data: Alert data to include in email
        """
        # TODO: Implement actual email sending
        # Example implementation would use SMTP, SendGrid, SES, etc.
        
        logger.info(
            f"[EMAIL PLACEHOLDER] Would send alert email for: {alert_data['alert_type']}",
            extra={"extra_data": {"alert": alert_data}}
        )
        
        # Placeholder for actual implementation:
        # try:
        #     send_email(
        #         to=settings.ALERT_EMAIL_RECIPIENTS,
        #         subject=f"[ALERT] {alert_data['alert_type']}",
        #         body=json.dumps(alert_data, indent=2)
        #     )
        # except Exception as e:
        #     logger.error(f"Failed to send alert email: {e}")
    
    def alert_unhandled_exception(
        self,
        exception: Exception,
        method: str,
        path: str,
        user_id: Optional[str] = None,
        **kwargs
    ):
        """
        Alert for unhandled exception.
        
        Args:
            exception: The unhandled exception
            method: HTTP method
            path: Request path
            user_id: Optional user ID
            **kwargs: Additional context
        """
        context = {
            "method": method,
            "path": path,
            "user_id": user_id,
            "exception_type": type(exception).__name__,
            "exception_message": str(exception),
            **kwargs
        }
        
        self.trigger_alert(
            alert_type="unhandled_exception",
            message=f"Unhandled {type(exception).__name__}: {str(exception)}",
            severity="critical",
            context=context
        )
    
    def alert_http_500(
        self,
        method: str,
        path: str,
        status_code: int,
        duration_ms: float,
        user_id: Optional[str] = None,
        **kwargs
    ):
        """
        Alert for HTTP 500+ response.
        
        Args:
            method: HTTP method
            path: Request path
            status_code: HTTP status code
            duration_ms: Request duration
            user_id: Optional user ID
            **kwargs: Additional context
        """
        context = {
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration_ms,
            "user_id": user_id,
            **kwargs
        }
        
        self.trigger_alert(
            alert_type="http_500_error",
            message=f"HTTP {status_code} error on {method} {path}",
            severity="high" if status_code < 503 else "critical",
            context=context
        )
    
    def alert_database_error(self, error_message: str, **kwargs):
        """
        Alert for database connection or query errors.
        
        Args:
            error_message: Error message
            **kwargs: Additional context
        """
        self.trigger_alert(
            alert_type="database_error",
            message=error_message,
            severity="critical",
            context=kwargs
        )


class AlertFormatter(logging.Formatter):
    """Custom formatter for alert logs (JSON format)."""
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format alert record as JSON.
        
        Args:
            record: Log record
            
        Returns:
            JSON formatted string
        """
        alert_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage()
        }
        
        # Add alert data if present
        if hasattr(record, "alert_data"):
            alert_entry.update(record.alert_data)
        
        # Add exception info if present
        if record.exc_info:
            alert_entry["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(alert_entry, default=str)


# Global alert manager instance
alert_manager = AlertManager()
