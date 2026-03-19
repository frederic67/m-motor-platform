import logging
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import Any


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured JSON logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record as structured JSON.
        
        Args:
            record: Log record to format
            
        Returns:
            JSON formatted log string
        """
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields if present
        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
            log_data["exception_type"] = record.exc_info[0].__name__ if record.exc_info[0] else None
        
        # Add stack trace if present
        if record.stack_info:
            log_data["stack_trace"] = self.formatStack(record.stack_info)
        
        return json.dumps(log_data, default=str)


class ConsoleFormatter(logging.Formatter):
    """Human-readable formatter for console output"""
    
    # Color codes for different log levels
    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m',       # Reset
    }
    
    def format(self, record: logging.LogRecord) -> str:
        """
        Format log record for console with colors.
        
        Args:
            record: Log record to format
            
        Returns:
            Formatted log string with colors
        """
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']
        
        # Build base message
        timestamp = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
        level = f"{color}{record.levelname:8}{reset}"
        location = f"{record.module}.{record.funcName}:{record.lineno}"
        message = record.getMessage()
        
        log_line = f"{timestamp} | {level} | {location:40} | {message}"
        
        # Add extra data if present
        if hasattr(record, "extra_data"):
            extra_str = " | " + " | ".join(
                f"{k}={v}" for k, v in record.extra_data.items()
            )
            log_line += extra_str
        
        # Add exception if present
        if record.exc_info:
            log_line += "\n" + self.formatException(record.exc_info)
        
        return log_line


def setup_logging() -> logging.Logger:
    """
    Setup structured logging with console and file handlers.
    
    Returns:
        Configured logger instance
    """
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Get or create logger
    logger = logging.getLogger("m-motor")
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # Console handler with human-readable format
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(ConsoleFormatter())
    logger.addHandler(console_handler)
    
    # File handler with JSON format
    file_handler = logging.FileHandler("logs/app.log", encoding="utf-8")
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(StructuredFormatter())
    logger.addHandler(file_handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger


# Global logger instance
logger = logging.getLogger("m-motor")


def log_with_extra(level: str, message: str, **extra_data):
    """
    Log message with extra structured data.
    
    Args:
        level: Log level (INFO, WARNING, ERROR, etc.)
        message: Log message
        **extra_data: Additional data to include in log
    """
    log_func = getattr(logger, level.lower())
    log_func(message, extra={"extra_data": extra_data})
