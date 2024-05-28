<?php

namespace IPP\Student;


use IPP\Core\Interface\InputReader;
use IPP\Core\Interface\OutputWriter;


require_once "Instruction.php";
require_once "Exception.php";

class ProgramFlow
{

    /**
     * @var array<string, int>
     */
    private array $labels;
    private int $programCounter;
    /**
     * @var int[]
     */
    private array $callstack;

    public function __construct()
    {
        $this->labels = [];
        $this->programCounter = 0;
        $this->callstack = [];
    }

    /**
     * adds a label and stores the index
     * @param string $label
     * @param int $order
     * @return void
     * @throws SemanticException
     */
    public function addLabel(string $label, int $order):void
    {

        //check if label already exists
        if(array_key_exists($label, $this->labels)){
            throw new SemanticException();
        }
        $this->labels[$label] = $order;
    }

    /**
     * jumps to the label and changes program counter accordingly
     * @param string $label
     * @return void
     * @throws SemanticException
     */
    public function jump(string $label):void
    {
        //check if label exists
        if(!array_key_exists($label, $this->labels)){
            throw new SemanticException();
        }
        $this->programCounter = $this->labels[$label];
    }

    /**
     * creates an instruction object and executes it
     * @param \DOMElement[] $instructions
     * @param FrameManager $frameManager
     * @param OutputWriter $stdout
     * @param InputReader $input
     * @param OutputWriter $stderr
     * @return void
     * @throws SemanticException
     * @throws WrongValueException
     */
    public function executeInstructions(array $instructions, FrameManager $frameManager, OutputWriter $stdout, InputReader $input, OutputWriter $stderr):void
    {
        $instructionCount = count($instructions);
        while ($this->programCounter < $instructionCount) {
            $instructionElement = $instructions[$this->programCounter];
            if ($instructionElement !== null) {
                $opcode = $instructionElement->getAttribute('opcode');
                $opcode = strtoupper($opcode);
                $order = (int)$instructionElement->getAttribute('order');

                // Get  arg1, arg2, arg3 and its type
                $arg1Element = $instructionElement->getElementsByTagName('arg1')->item(0);
                $arg2Element = $instructionElement->getElementsByTagName('arg2')->item(0);
                $arg3Element = $instructionElement->getElementsByTagName('arg3')->item(0);

                $arg1 = $arg1Element ? new Argument($arg1Element->nodeValue !== null ? trim($arg1Element->nodeValue) : '', $arg1Element->getAttribute('type')) : null;
                $arg2 = $arg2Element ? new Argument($arg2Element->nodeValue !== null ? trim($arg2Element->nodeValue) : '', $arg2Element->getAttribute('type')) : null;
                $arg3 = $arg3Element ? new Argument($arg3Element->nodeValue !== null ? trim($arg3Element->nodeValue) : '', $arg3Element->getAttribute('type')) : null;


                $args = array_filter([$arg1, $arg2, $arg3], function($arg) {
                    return $arg !== null;
                });

                // Create the instruction object and execute it
                $instruction = InstructionFactory::create($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $this);
                $instruction->execute();
            }
            $this->programCounter++;
        }
    }

    /**
     * stores the current program counter on the callstack and jumps to the label
     * @param string $label
     * @return void
     * @throws SemanticException
     */
    public function call(string $label):void
    {
        array_push($this->callstack, $this->programCounter);
        $this->jump($label);
    }


    /**
     * returns the program counter to the last stored value
     * @return void
     * @throws MissingValueException
     * @throws WrongValueException
     */
    public function return():void
    {
        //check if callstack is empty
        if(empty ($this->callstack)){
            throw new MissingValueException();
        }
        $value = array_pop($this->callstack);
        if(!is_int($value)){
            throw new WrongValueException();
        }
        $this->programCounter = $value;

    }
}