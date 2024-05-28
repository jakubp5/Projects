<?php



namespace IPP\Student;


use IPP\Core\Interface\OutputWriter;
use IPP\Core\Interface\InputReader;

abstract class Instruction {


    /**
     * @var Argument[]
     */
    protected array $args;
    protected string $opcode;
    protected int $order;
    protected FrameManager $frames;
    protected OutputWriter $stdout;
    protected InputReader $input;
    protected OutputWriter $stderr;

    protected mixed $arg1;
    protected mixed $arg2;
    protected mixed $arg3;
    protected ?string $arg1Type;
    protected ?string $arg2Type;
    protected ?string $arg3Type;
    protected ProgramFlow $programFlow;


    /**
     * @param string $opcode
     * @param Argument[] $args
     * @param int $order
     * @param FrameManager $frames
     * @param OutputWriter $stdout
     * @param InputReader $input
     * @param OutputWriter $stderr
     * @param ProgramFlow $programFlow
     */
    public function __construct(string $opcode, array $args, int $order, FrameManager $frames, OutputWriter $stdout, InputReader $input, OutputWriter $stderr, ProgramFlow $programFlow) {
        $this->args = $args;
        $this->opcode = $opcode;
        $this->order = $order;
        $this->frames = $frames;
        $this->stdout = $stdout;
        $this->arg1 = isset($args[0]) ? $args[0]->value : null;
        $this->arg2 = isset($args[1]) ? $args[1]->value : null;
        $this->arg3 = isset($args[2]) ? $args[2]->value : null;
        $this->arg1Type = isset($args[0]) ? $args[0]->type : null;
        $this->arg2Type = isset($args[1]) ? $args[1]->type : null;
        $this->arg3Type = isset($args[2]) ? $args[2]->type : null;
        $this->programFlow = $programFlow;
        $this->input = $input;
        $this->stderr = $stderr;
    }


    /**
     * function retrieves the value and type of the argument
     * @param mixed $arg
     * @param mixed $argType
     * @return array{0: mixed, 1: mixed}
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    protected function getArgValueAndType(mixed $arg, mixed $argType): array
    {

        if($argType == "var") {
            $value = $this->frames->getVariable($arg);
            $type = $this->frames->getVariableType($arg);
        }
        else{
            $value = $arg;
            $type = $argType;
        }

        return [$value, $type];
    }

    abstract public function execute(): void;
}

class MoveInstruction extends Instruction {
    /**
     * moves the value to a variable
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value, $type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        $this->frames->setVariable($this->arg1, $value, $type);
    }
}

class DefVarInstruction extends Instruction
{
    /**
     * creates a new variable
     * @return void
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        //print arg1
        $this->frames->defVar($this->arg1);
    }

}

class CreateFrameInstruction extends Instruction {
    /**
     * creates a new frame
     * @return void
     */
    public function execute(): void{
        $this->frames->createFrame();
    }
}
class PushFrameInstruction extends Instruction {
    /**
     * pushes  current frame to the stack
     * @return void
     * @throws FrameException
     */
    public function execute(): void {
        $this->frames->pushFrame();
    }
}

class PopSInstruction extends Instruction {
    /**
     * pops value from the stack and stores it in a variable
     * @throws MissingVariableException
     * @throws WrongTypeException
     * @throws MissingValueException
     */
    public function execute(): void {
        $value = $this->frames->popStack();
        $this->frames->setVariable($this->arg1, $value['value'], $value['type']);
    }
}

class PushSInstruction extends Instruction {
    /**
     * pushes value to the stack
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void {

        list($value, $type) = $this->getArgValueAndType($this->arg1, $this->arg1Type);
        if(!is_string($type)){
            throw new WrongTypeException();
        }
        $this->frames->pushStack($value, $type);
    }
}

class PopFrameInstruction extends Instruction {
    /**
     * pops current frame from the stack
     * @return void
     * @throws FrameException
     */
    public function execute(): void {
        $this->frames->popFrame();
    }
}

class WriteInstruction extends Instruction {
    /**
     * writes value to the output
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value, $type) = $this->getArgValueAndType($this->arg1, $this->arg1Type);
        if(is_string($value) && $type == "string"){
            // Replace escape sequences with their corresponding characters
            $value = preg_replace_callback('/\\\\(\d{3})/', function($matches) {
                return chr(intval($matches[1]));
            }, $value);
        }

        //echo type
        switch ($type){
            case 'int':
                if(!is_int($value)){
                    throw new WrongTypeException();
                }
                $this->stdout->writeInt($value);
                break;
            case 'bool':
                $this->stdout->writeBool((bool)$value);
                break;
            case 'string':
                if(!is_string($value)){
                    throw new WrongTypeException();
                }
                $this->stdout->writeString((string)$value);
                break;
            case 'nil':
                $this->stdout->writeString("");
                break;
            default:
                throw new WrongTypeException();
        }

    }
}

abstract class ArithmeticInstruction extends Instruction {

    /**
     * adds, subtracts, multiplies or divides two integers
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {

        list($value1, $value1type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($value2, $value2type) = $this->getArgValueAndType($this->arg3, $this->arg3Type);


        if($value1type != "int" || $value2type != "int"){
            throw new WrongTypeException();
        }

        if (!is_int($value1) || !is_int($value2)) {
            throw new WrongTypeException();
        }

        $result = $this->calculate($value1, $value2);

        $this->frames->setVariable($this->arg1, $result, "int");
    }

    abstract protected function calculate(int $value1, int $value2): int;
}

class MulInstruction extends ArithmeticInstruction{
    /**
     * multiplies two integers
     * @param int $value1
     * @param int $value2
     * @return int
     */
    protected function calculate(int $value1, int $value2): int
    {
        return $value1 * $value2;
    }
}

class AddInstruction extends ArithmeticInstruction{
    /**
     * adds two integers
     * @param int $value1
     * @param int $value2
     * @return int
     */
    protected function calculate(int $value1, int $value2): int
    {
        return $value1 + $value2;
    }
}

class SubInstruction extends ArithmeticInstruction{
    /**
     * subtracts two integers
     * @param int $value1
     * @param int $value2
     * @return int
     */
    protected function calculate(int $value1, int $value2): int
    {
        return $value1 - $value2;
    }
}

class IdivInstruction extends ArithmeticInstruction{
    /**
     * divides two integers
     * @param int $value1
     * @param int $value2
     * @return int
     * @throws WrongValueException
     */
    protected function calculate(int $value1, int $value2): int
    {
        if($value2 === 0){
            throw new WrongValueException();
        }

        return $value1 / $value2;
    }
}


class LabelInstruction extends Instruction{
    public function execute(): void
    {
        //do nothing
    }
}

class JumpInstruction extends Instruction{
    /**
     * jumps to a label
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($label, $labelType) = $this->getArgValueAndType($this->arg1, $this->arg1Type);

        if(!is_string($label)){
            throw new WrongTypeException();
        }

        $this->programFlow->jump($label);
    }
}

class JumpifeqInstruction extends Instruction{
    /**
     * jumps to a label if two values are equal
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {


        list($value1, $value1type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($value2, $value2type) = $this->getArgValueAndType($this->arg3, $this->arg3Type);
        list($label, $labelType) = $this->getArgValueAndType($this->arg1, $this->arg1Type);

        if($value1type != $value2type && $value1type != "nil" && $value2type != "nil"){
            throw new WrongTypeException();
        }

        if(!is_string($label)){
            throw new WrongTypeException();
        }

        if($value1 === $value2){
            $this->programFlow->jump($label);
        }
    }
}

class JumpifneqInstruction extends Instruction{
    /**
     * jumps to a label if two values are not equal
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value1, $value1type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($value2, $value2type) = $this->getArgValueAndType($this->arg3, $this->arg3Type);
        list($label, $labelType) = $this->getArgValueAndType($this->arg1, $this->arg1Type);

        if($value1type != $value2type){
            throw new WrongTypeException();
        }

        if(!is_string($label)){
            throw new WrongTypeException();
        }

        if($value1 != $value2){
            $this->programFlow->jump($label);
        }
    }
}
abstract class ComparisonInstruction extends Instruction {
    /**
     * compares two values
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {

        list($value1, $value1type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($value2, $value2type) = $this->getArgValueAndType($this->arg3, $this->arg3Type);


        if ( !is_string($value1type) || !is_string($value2type)) {
            throw new WrongTypeException();
        }



        $result = $this->compare($value1, $value2, $value1type, $value2type);
        $this->frames->setVariable($this->arg1, $result, "bool");
    }

    abstract protected function compare(mixed $value1, mixed $value2, string $value1type, string $value2type): bool;
}

class LtInstruction extends ComparisonInstruction{


    /**
     * returns true if arg2 is less than arg3
     * @param mixed $value1
     * @param mixed $value2
     * @param string $value1type
     * @param string $value2type
     * @return bool
     * @throws WrongTypeException
     */
    protected function compare(mixed $value1, mixed $value2, string $value1type, string $value2type): bool
    {

        if($value1type == 'nil' || $value2type == 'nil'){
            throw new WrongTypeException();
        }

        if($value1type != $value2type){
            throw new WrongTypeException();
        }

        return $value1 < $value2;
    }
}

class GtInstruction extends ComparisonInstruction{
    /**
     * returns true if arg2 is greater than arg3
     * @param mixed $value1
     * @param mixed $value2
     * @param string $value1type
     * @param string $value2type
     * @return bool
     * @throws WrongTypeException
     */
    protected function compare(mixed $value1, mixed $value2, string $value1type, string $value2type): bool
    {
        if($value1type == 'nil' || $value2type == 'nil'){
            throw new WrongTypeException();
        }

        if($value1type != $value2type){
            throw new WrongTypeException();
        }

       return $value1 > $value2;
    }
}

class EqInstruction extends ComparisonInstruction{
    /**
     * returns true if arg2 is equal to arg3
     * @param mixed $value1
     * @param mixed $value2
     * @param string $value1type
     * @param string $value2type
     * @return bool
     * @throws WrongTypeException
     */
    protected function compare(mixed $value1, mixed $value2, string $value1type, string $value2type): bool
    {
        // If both values are nil, return true
        if($value1type == "nil" && $value2type == "nil"){
            return true;
        }

        // If one value is nil and the other is not, return false
        if($value1type == "nil" || $value2type == "nil"){
            return false;
        }

        // If the types of the two values are not the same, return false
        if($value1type != $value2type){
            throw new WrongTypeException();
        }

        // If neither value is nil, compare the values
        return $value1 === $value2;
    }
}

class ConcatInstruction extends Instruction{
    /**
     * concatenates two strings
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value1, $value1type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($value2, $value2type) = $this->getArgValueAndType($this->arg3, $this->arg3Type);

        //check if both are strings
        if($value1type != "string" || $value2type != "string"){
            throw new WrongTypeException();
        }

        $result = $value1 . $value2;
        $this->frames->setVariable($this->arg1, $result, "string");
    }
}

abstract class BooleanInstruction extends Instruction {
    /**
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {

        list($value1, $value1type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($value2, $value2type) = $this->getArgValueAndType($this->arg3, $this->arg3Type);


        if(!is_bool($value1) || !is_bool($value2)){
            throw new WrongTypeException();
        }


        $result = $this->compare($value1, $value2);
        $this->frames->setVariable($this->arg1, $result, "bool");
    }

    abstract protected function compare(bool $value1, bool $value2): bool;
}

class AndInstruction extends BooleanInstruction{
    /**
     * @param bool $value1
     * @param bool $value2
     * @return bool
     */
    protected function compare(bool $value1, bool $value2): bool
    {

        return $value1 && $value2;
    }
}

class OrInstruction extends BooleanInstruction{
    /**
     * @param bool $value1
     * @param bool $value2
     * @return bool
     */
    protected function compare(bool $value1, bool $value2): bool
    {
        return $value1 || $value2;
    }
}

class NotInstruction extends Instruction{
    /**
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value, $valueType) = $this->getArgValueAndType($this->arg2, $this->arg2Type);


        if($valueType != "bool"){
            throw new WrongTypeException();
        }
        $this->frames->setVariable($this->arg1, !$value, "bool");
    }
}

class StrlenInstruction extends Instruction{
    /**
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value, $type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);

        if($type != "string"){
            throw new WrongTypeException();
        }

        if(!is_string($value)){
            throw new WrongTypeException();
        }

        $this->frames->setVariable($this->arg1, strlen($value), "int");
    }
}

class GetcharInstruction extends Instruction{
    /**
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws StringException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($indexvalue, $indextype) = $this->getArgValueAndType($this->arg3, $this->arg3Type);

        list($stringvalue, $stringtype) = $this->getArgValueAndType($this->arg2, $this->arg2Type);

        if($indextype != "int" || $stringtype != "string"){
            throw new WrongTypeException();
        }

        if(!is_string($stringvalue)){
            throw new WrongTypeException();
        }

        //check if index is in range
        if($indexvalue < 0 || $indexvalue >= strlen($stringvalue)){
            throw new StringException();
        }

        $this->frames->setVariable($this->arg1, $stringvalue[$indexvalue], "string");
    }
}

class TypeInstruction extends Instruction{
    /**
     * stores the type of variable
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        $type = null;
        if($this->arg2Type == "var"){
            $type = $this->frames->getVariableType($this->arg2);
        }
        else{
            $type = $this->arg2Type;
        }


        if($this->arg2Type == "var" && $type == "nil"){
            return;
        }

        $this->frames->setVariable($this->arg1, $type, "string");
    }
}

class Int2charInstruction extends Instruction{
    /**
     * converts an integer to a character
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws StringException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($value, $type) = $this->getArgValueAndType($this->arg2, $this->arg2Type);

        if($type != "int"){
            throw new WrongTypeException();
        }

        if(!is_int($value)){
            throw new WrongTypeException();
        }

        if($value < 0 || $value > 255){
            throw new StringException();
        }



        $this->frames->setVariable($this->arg1, chr($value), "string");
    }
}

class Stri2intInstruction extends Instruction{
    /**
     * converts a character to an integer
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws StringException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($string, $stringType) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($index, $indexType) = $this->getArgValueAndType($this->arg3, $this->arg3Type);

        if($stringType != "string" || $indexType != "int"){
            throw new WrongTypeException();
        }

        if(!is_string($string)){
            throw new WrongTypeException();
        }

        if($index < 0 || $index >= strlen($string)){
            throw new StringException();
        }

            $this->frames->setVariable($this->arg1, ord($string[$index]), "int");
    }
}

class SetcharInstruction extends Instruction
{
    /**
     * sets a character in a string
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws StringException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($string, $stringType) = $this->getArgValueAndType($this->arg1, $this->arg1Type);
        list($index, $indexType) = $this->getArgValueAndType($this->arg2, $this->arg2Type);
        list($char, $charType) = $this->getArgValueAndType($this->arg3, $this->arg3Type);

        if ($stringType != "string" || $indexType != "int" || $charType != "string") {
            throw new WrongTypeException();
        }

        if(!is_string($string) || !is_string($char) || !is_int($index)){
            throw new WrongTypeException();
        }

        if ($index < 0 || $index >= strlen($string)) {
            throw new StringException();
        }

        $string[$index] = $char;
        $this->frames->setVariable($this->arg1, $string, "string");
    }
}

class ReturnInstruction extends Instruction{
    /**
     * returns
     * @return void
     * @throws MissingValueException
     * @throws WrongValueException
     */
    public function execute(): void
    {
        $this->programFlow->return();
    }
}

class CallInstruction extends Instruction{
    /**
     * saves the current position and jumps to a label
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     */
    public function execute(): void
    {
        list($label, $labelType) = $this->getArgValueAndType($this->arg1, $this->arg1Type);
        if(!is_string($label)){
            throw new WrongTypeException();
        }
        $this->programFlow->call($label);
    }
}

class ReadInstruction extends Instruction{
    /**
     * reads from input and stores it in a variable
     * @return void
     * @throws MissingVariableException
     * @throws WrongTypeException
     */
    public function execute(): void {
    //type is in arg2
        switch ($this->arg2){
            case 'int':
                $input = $this->input->readInt();
                break;
            case 'bool':
                $input = $this->input->readBool();
                break;
            case 'string':
                $input = $this->input->readString();
                break;
            case 'nil':
                $input = null;
                break;
            default:
                throw new WrongTypeException();
        }

        if($input === null){
            $this->frames->setVariable($this->arg1, $input, "nil");
            return;
        }

        $this->frames->setVariable($this->arg1, $input, $this->arg2);
    }
}

class ExitInstruction extends Instruction {
    /**
     * exits with given code
     * @return void
     * @throws MissingVariableException
     * @throws SemanticException
     * @throws WrongTypeException
     * @throws WrongValueException
     */
    public function execute(): void
    {
        list($exitCode, $exitCodeType) = $this->getArgValueAndType($this->arg1, $this->arg1Type);

        if($exitCodeType != "int"){
            throw new WrongTypeException();
        }

        if($exitCode < 0 || $exitCode > 9){
            throw new WrongValueException();
        }

        exit($exitCode);
    }
}

class DprintInstruction extends Instruction{
    public function execute(): void
    {
        list($value, $type) = $this->getArgValueAndType($this->arg1, $this->arg1Type);
        switch ($type){
            case 'int':
                if(!is_int($value)){
                    throw new WrongTypeException();
                }
                $this->stderr->writeInt($value);
                break;
            case 'bool':
                if(!is_bool($value)){
                    throw new WrongTypeException();
                }
                $this->stderr->writeBool($value);
                break;
            case 'string':
                if(!is_string($value)){
                    throw new WrongTypeException();
                }
                $this->stderr->writeString($value);
                break;
            case 'nil':
                $this->stderr->writeString("");
                break;
            default:
                throw new WrongTypeException();
        }
    }
}

class BreakInstruction extends Instruction{
    /**
     * @return void
     */
    public function execute(): void
    {
        $this->stderr->writeString("Placeholder");
    }
}
