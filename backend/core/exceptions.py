from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "error": True,
            "status_code": response.status_code,
            "message": _extract_message(response.data),
            "details": response.data,
        }
        response.data = error_data

    return response


def _extract_message(data):
    if isinstance(data, dict):
        for key in ("detail", "non_field_errors", "message"):
            if key in data:
                val = data[key]
                if isinstance(val, list):
                    return str(val[0])
                return str(val)
        # Grab first field error
        for val in data.values():
            if isinstance(val, list) and val:
                return str(val[0])
    if isinstance(data, list) and data:
        return str(data[0])
    return str(data)
