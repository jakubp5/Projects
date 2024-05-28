<?php

namespace IPP\Student;
use Exception;


class FrameManager
{


    /**
     * @var array<string, array{type: mixed, value: mixed}>
     */
    private array $globalFrame;
    /**
     * @var array<string, array{type: mixed, value: mixed}>
     */
    private ?array $tempFrame;
    /**
     * @var array<array<string, array{type: mixed, value: mixed}>>.
     */
    private array $frameStack; // Stack for Local and Temporary Frames
    /**
     * @var array<string, array{type: mixed, value: mixed}>
     */
    private ?array $localFrame;

    /**
     * @var array<string, array{type: mixed, value: mixed}>
     */
    private array $dataStack;


    public function __construct()
    {
        $this->globalFrame = [];
        $this->localFrame = null;
        $this->tempFrame = null;
        $this->frameStack = [];
        $this->dataStack = [];
    }

    /**
     * creates a new temporary frame
     * @return void
     */
    public function createFrame(): void
    {
        $this->tempFrame = [];
    }


    /**
     * push the temporary frame to the frame stack and set it as the local frame
     * @return void
     * @throws FrameException
     */
    public function pushFrame(): void
    {
        //check if frame isnt null
        if($this->tempFrame === null){
            throw new FrameException();
        }
        array_push($this->frameStack, $this->tempFrame);
        $this->localFrame = $this->tempFrame;
        $this->tempFrame = null;

    }




    /**
     * pops the last frame from the frame stack and sets it as the temporary frame
     * @return void
     * @throws FrameException
     */
    public function popFrame() : void
    {
        if (!empty($this->frameStack)) {
            array_pop($this->frameStack);
            $this->tempFrame = $this->localFrame;

            if(!empty($this->frameStack)) {
                $this->localFrame = end($this->frameStack);
            } else {
                $this->localFrame = null;
            }

        }
        else {
            throw new FrameException();
        }
    }

    /**
     * push a new value to the data stack
     * @param mixed $value
     * @param string|null $type
     * @return void
     */
    public function pushStack(mixed $value, ?string $type): void
    {
        array_push($this->dataStack, ['value' => $value, 'type' => $type]);
    }

    /**
     * returns the value of the variable
     * @param mixed $arg1
     * @return mixed
     * @throws FrameException
     * @throws WrongTypeException
     */
    public function getVariable(mixed $arg1): mixed
    {

        $arg1 = is_string($arg1) ? explode('@', $arg1) : throw new WrongTypeException();
        $frame = $arg1[0];
        $var = $arg1[1];

        switch ($frame) {
            case 'GF':
                if (!isset($this->globalFrame[$var])) {
                    throw new FrameException();
                }
                return $this->globalFrame[$var]['value'];
            case 'LF':
                if (!isset($this->localFrame[$var])) {
                    throw new FrameException();
                }
                return $this->localFrame[$var]['value'];
            case 'TF':
                if (!isset($this->tempFrame[$var])) {

                    throw new FrameException();
                }
                return $this->tempFrame[$var]['value'];
            default:
                throw new FrameException();
        }
    }

    /**
     * pops the last value from the data stack
     * @return array{value: mixed, type: mixed}
     * @throws MissingValueException
     */
    public function popStack(): array
    {
        if (empty($this->dataStack)) {
            throw new MissingValueException();
        }
        return array_pop($this->dataStack);
    }

    /**
     * sets value and type of the variable
     * @param mixed $arg1
     * @param mixed $value
     * @param mixed $type
     * @return void
     * @throws MissingVariableException
     * @throws WrongTypeException
     */
    public function setVariable(mixed $arg1, mixed $value, mixed $type): void
    {
        $arg1 = is_string($arg1) ? explode('@', $arg1) : throw new WrongTypeException();
        $frame = $arg1[0];
        $var = $arg1[1];

        switch ($frame) {
            case 'GF':
                if (!array_key_exists($var, $this->globalFrame)) {
                    throw new MissingVariableException();
                }
                $this->globalFrame[$var]['value'] = $value;
                $this->globalFrame[$var]['type'] = $type;
                break;
            case 'LF':
                if ($this->localFrame === null || !array_key_exists($var, $this->localFrame)) {
                    throw new MissingVariableException();
                }
                $this->localFrame[$var]['value'] = $value;
                $this->localFrame[$var]['type'] = $type;
                break;
            case 'TF':
                if ($this->tempFrame === null || !array_key_exists($var, $this->tempFrame)) {
                    throw new MissingVariableException();
                }
                $this->tempFrame[$var]['value'] = $value;
                $this->tempFrame[$var]['type'] = $type;
                break;
            default:
                throw new SemanticException();
        }
    }

    /**
     * defines a new variable in the frame
     * @param mixed $arg
     * @return void
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function defVar(mixed $arg): void
    {
    $arg = is_string($arg) ? explode('@', $arg) : throw new WrongTypeException();
    $frame = $arg[0];
    $var = $arg[1];

    $variable = [
        'type' => 'nil', // default type
        'value' => null, // default value
    ];

    switch ($frame)
    {
        case 'GF':
            if (isset($this->globalFrame[$var])) {
                throw new SemanticException();
            }
            $this->globalFrame[$var] = $variable;
            break;
        case 'LF':
            if (isset($this->localFrame[$var])) {
                throw new SemanticException();
            }
            $this->localFrame[$var] = $variable;
            break;
        case 'TF':
            if($this->tempFrame === null){
                throw new SemanticException();
            }

            if (isset($this->tempFrame[$var])) {
                throw new SemanticException();
            }
            $this->tempFrame[$var] = $variable;
            break;
        default:
            throw new SemanticException();
        }
    }


    /**
     * returns the type of the variable
     * @param mixed $arg1
     * @return mixed
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function getVariableType(mixed $arg1): mixed
    {
        $arg1 = is_string($arg1) ? explode('@', $arg1) : throw new WrongTypeException();
        $frame = $arg1[0];
        $var = $arg1[1];

        switch ($frame) {
            case 'GF':
                if (!isset($this->globalFrame[$var])) {
                    throw new MissingVariableException();
                }
                return $this->globalFrame[$var]['type'];
            case 'LF':
                if (!isset($this->localFrame[$var])) {
                    throw new MissingVariableException();
                }
                return $this->localFrame[$var]['type'];
            case 'TF':
                if (!isset($this->tempFrame[$var])) {
                    throw new MissingVariableException();
                }
                return $this->tempFrame[$var]['type'];
            default:
                throw new SemanticException();
        }
    }

    public function printFrames(): void
    {
        echo "Global Frame:\n";
        print_r($this->globalFrame);

        echo "\nLocal Frame:\n";
        if ($this->localFrame !== null) {
            print_r($this->localFrame);
        } else {
            echo "Local Frame is null\n";
        }

        echo "\nTemporary Frame:\n";
        if ($this->tempFrame !== null) {
            print_r($this->tempFrame);
        } else {
            echo "Temporary Frame is null\n";
        }

        echo "\nFrame Stack:\n";
        if (!empty($this->frameStack)) {
            print_r($this->frameStack);
        } else {
            echo "Frame Stack is empty\n";
        }
    }

}