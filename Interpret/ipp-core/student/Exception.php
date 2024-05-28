<?php

namespace IPP\Student;

use IPP\Core\Exception\IPPException;
use Throwable;


//52 - chyba při sémantických kontrolách vstupního kódu v IPPcode24 (např. použití nedefino-
//vaného návěští, redefinice proměnné);
//• 53 - běhová chyba interpretace – špatné typy operandů;
//• 54 - běhová chyba interpretace – přístup k neexistující proměnné (paměťový rámec existuje);
//• 55 - běhová chyba interpretace – paměťový rámec neexistuje (např. čtení z prázdného zásobníku
//rámců);
//• 56 - běhová chyba interpretace – chybějící hodnota (v proměnné, na datovém zásobníku nebo
//v zásobníku volání);
//• 57 - běhová chyba interpretace – špatná hodnota operandu (např. dělení nulou, špatná návra-
//tová hodnota instrukce EXIT);
//• 58 - běhová chyba interpretace – chybná práce s řetězcem.

class SemanticException extends IPPException
{
    public function __construct(string $message = "Semantic error", int $code = 52, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

class WrongTypeException extends IPPException
{
    public function __construct(string $message = "Incorrect types", int $code = 53, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

class MissingVariableException extends IPPException
{
    public function __construct(string $message = "Missing variable", int $code = 54, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

class FrameException extends IPPException
{
    public function __construct(string $message = "Incorrect work with frames", int $code = 55, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

class MissingValueException extends IPPException
{
    public function __construct(string $message = "Missing value", int $code = 56, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

class WrongValueException extends IPPException
{
    public function __construct(string $message = "Wrong values", int $code = 57, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

class StringException extends IPPException
{
    public function __construct(string $message = "Incorrect string handling", int $code = 58, Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}

