<?php

namespace IPP\Student;




class Argument
{
    public mixed $value;
    public ?string $type;

    public function __construct(mixed $value, ?string $type) {
        $this->type = $type;
        switch ($type) {
            case 'int':
                if (is_numeric($value)) {
                    $this->value = (int)$value;
                } else {
                    throw new WrongValueException();
                }
                break;
            case 'bool':
                $this->value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
                break;
            case 'string':
                if (is_scalar($value) || is_null($value)) {
                    $this->value = (string)$value;
                } else {
                    throw new WrongValueException();
                }
                break;
            case 'nil':
                $this->value = null;
                break;
            default:
                $this->value = $value;
        }
    }
}