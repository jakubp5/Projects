<?php

namespace IPP\Student;

use IPP\Core\Interface\InputReader;
use IPP\Core\Interface\OutputWriter;



require_once "Instruction.php";
require_once "Exception.php";

class InstructionFactory {
    /**
     * @brief Factory method for creating instructions
     * @param string $opcode
     * @param Argument[] $args
     * @param int $order
     * @param FrameManager $frameManager
     * @param OutputWriter $stdout
     * @param InputReader $input
     * @param OutputWriter $stderr
     * @param ProgramFlow $programFlow
     * @return Instruction
     * @throws SemanticException
     */
    public static function create(string $opcode, array $args, int $order, FrameManager $frameManager, OutputWriter $stdout, InputReader $input, $stderr, ProgramFlow $programFlow): Instruction {

        return match ($opcode) {
            'MOVE' => new MoveInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'CREATEFRAME' => new CreateFrameInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'DEFVAR' => new DefVarInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'WRITE' => new WriteInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'ADD' => new AddInstruction($opcode, $args, $order, $frameManager, $stdout, $input,$stderr, $programFlow),
            'SUB' => new SubInstruction($opcode, $args, $order, $frameManager, $stdout, $input,$stderr, $programFlow),
            'MUL' => new MulInstruction($opcode, $args, $order, $frameManager, $stdout, $input,$stderr, $programFlow),
            'IDIV' => new IdivInstruction($opcode, $args, $order, $frameManager, $stdout, $input,$stderr, $programFlow),
            'PUSHFRAME' => new PushFrameInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'POPFRAME' => new PopFrameInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'POPS' => new PopSInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'LABEL' => new LabelInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'PUSHS' => new PushSInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'JUMP' => new JumpInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'STRLEN' => new StrlenInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'JUMPIFEQ' => new JumpifeqInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'JUMPIFNEQ' => new JumpifneqInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr,$programFlow),
            'LT' => new LtInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'GT' => new GtInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'EQ' => new EqInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'OR' => new OrInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr,$programFlow),
            'AND' => new AndInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'NOT' => new NotInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'CONCAT' => new ConcatInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'GETCHAR' => new GetcharInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'SETCHAR' => new SetcharInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'TYPE' => new TypeInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'INT2CHAR' => new Int2charInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'STRI2INT' => new Stri2intInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'CALL' => new CallInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'RETURN' => new ReturnInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'EXIT' => new ExitInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'READ' => new ReadInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'DPRINT' => new DprintInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            'BREAK' => new BreakInstruction($opcode, $args, $order, $frameManager, $stdout, $input, $stderr, $programFlow),
            default => throw new SemanticException(),
        };
    }
}