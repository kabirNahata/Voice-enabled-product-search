namespace Application.Common;

public class AppValidationException(string message) : Exception(message);
public class NotFoundException(string message) : Exception(message);