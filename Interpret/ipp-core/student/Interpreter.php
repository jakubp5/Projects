<?php


namespace IPP\Student;

use IPP\Core\AbstractInterpreter;

require_once "Instruction.php";
require_once "Exception.php";


class Interpreter extends AbstractInterpreter
{
    public function execute(): int
    {

        //load instructions
        $dom = $this->source->getDOMDocument();
        $instructions = $dom->getElementsByTagName('instruction');

        // Sort instructions by order attribute
        $instructions = iterator_to_array($instructions);
        usort($instructions, function($a, $b) {
            $orderA = (int)$a->getAttribute('order');
            $orderB = (int)$b->getAttribute('order');
            return $orderA - $orderB;
        });


        $frameManager = new FrameManager();
        $programFlow = new ProgramFlow();


        // Go through instructions and store labels
        foreach ($instructions as $index => $instructionElement) {
            $opcode = $instructionElement->getAttribute('opcode');
            if ($opcode === 'LABEL') {
                $arg1Element = $instructionElement->getElementsByTagName('arg1')->item(0);
                if ($arg1Element) {
                    $label = $arg1Element->nodeValue !== null ? trim($arg1Element->nodeValue) : '';
                    $programFlow->addLabel($label, $index);
                }
            }
        }

        $programFlow->executeInstructions($instructions, $frameManager, $this->stdout, $this->input, $this->stderr);

        return 0;
    }
}