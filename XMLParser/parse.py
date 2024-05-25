#author: xpogad00

import sys
import xml.etree.ElementTree as ET
import re
import argparse

#check if var contains GF@ LF@ or TF@
def check_var(arg):
    if not re.match(r'^(GF@|LF@|TF@)[a-zA-Z_\-$&%*!?][a-zA-Z0-9_\-$&%*!?]*$', arg):
        sys.exit(23)


#check if label is valid
def check_label(arg):
    if not re.match(r'[a-zA-Z_\-$&%*!?][a-zA-Z0-9_\-$&%*!?]*$', arg):
        sys.exit(23)

#check decimal, octal and hexadecimal numbers
def check_int(arg):
    if re.match(r'^int@(0o|-0o)', arg):
        if not re.match(r'^int@[-+]?0o[0-7]+$', arg):
            sys.exit(23)
    elif re.match(r'^int@(0x|-0x)', arg):
        if not re.match(r'^int@[-+]?0x[0-9a-fA-F]+$', arg):
            sys.exit(23)
    else:
        if not re.match(r'^int@[-+]?[0-9]+$', arg):
            sys.exit(23)

#check if bool is true or false
def check_bool(arg):
    if not re.match(r'^bool@(true|false)$', arg):
        sys.exit(23)

def check_string(arg):
    #look for xml special characters and replace them
    arg = arg.replace("&", "&amp;")
    arg = arg.replace("<", "&lt;")
    arg = arg.replace(">", "&gt;")
    #expect three digits after backslash    
    i = 0
    while i < len(arg):
        if arg[i] == '\\':
            if i + 3 >= len(arg) or not arg[i + 1:i + 4].isdigit():
                sys.exit(23)
            i += 4  
        else:
            i += 1
    return arg

#add arg to the instruction
def add_arg(child, arg, arg_num):
    if arg.startswith("int@") or arg.startswith("bool@") or arg.startswith("string@") or arg.startswith("nil@"):
        
        if arg.startswith("string@"):
            check_string(arg)
        elif arg.startswith("int@"):
            check_int(arg)
        elif arg.startswith("bool@"):
            check_bool(arg)
        elif arg.startswith("nil@"):
            if arg != "nil@nil":
                sys.exit(23)

        arg2 = ET.SubElement(child, arg_num, type=arg.split('@')[0])
        arg2.text = arg.split('@', 1)[1]
    elif arg.startswith("GF@") or arg.startswith("LF@") or arg.startswith("TF@"):
        arg2 = ET.SubElement(child, arg_num, type="var")
        arg2.text = arg
    else:
        sys.exit(23)

#add instruction to the root
def add_instruction(root, opcode, instruction, args, var_label):
    child = ET.SubElement(root, "instruction", order=str(instruction), opcode=opcode)
    arg1 = ET.SubElement(child, "arg1", type=var_label)    
    arg1.text = args[0]
    return child

if __name__ == '__main__':
    root = ET.Element("program", language="IPPcode24")
    
    parser = argparse.ArgumentParser(description='For execution use python 3 parse.py < input_file or python3 parse.py --help')

    cmdargs = parser.parse_args()

    instruction_count = 0
    
    for line in sys.stdin.readlines():
        #skip comments and empty lines
        if not line or line.startswith('#') or line == "\n":
            continue

        #check if the first line is .IPPcode24
        if instruction_count == 0 or re.match(r'^\.IPPcode24$', line.split('#')[0].strip()):
            if instruction_count > 0:
                sys.exit(23)
            if not re.match(r'^\.IPPcode24$', line.split('#')[0].strip()):
                sys.exit(21)
            instruction_count += 1
            continue


        #remove comments and split into opcode and args
        parts = line.split('#')[0].split()
        opcode = parts[0].upper()
        args = parts[1:]

        #add instructions to the root
        if opcode in ["PUSHFRAME", "CREATEFRAME", "POPFRAME", "RETURN", "BREAK"]:
            if len(args) != 0:
                sys.exit(23)
            child = ET.SubElement(root, "instruction", order=str(instruction_count), opcode=opcode)
            instruction_count += 1
            continue

        elif opcode in ["DEFVAR", "POPS"]:
            if len(args) != 1:
                sys.exit(23)

            check_var(args[0])

            child = add_instruction(root, opcode, instruction_count, args, "var")
            instruction_count += 1
        
        elif opcode in ["MUL", "SUB", "ADD", "IDIV", "LT", "GT", "EQ", "AND", "OR", "STRI2INT", "CONCAT", "GETCHAR", "SETCHAR"]:
            if len(args) != 3:
                sys.exit(23)

            check_var(args[0])

            child = add_instruction(root, opcode, instruction_count, args, "var")
            
            add_arg(child, args[1], "arg2")
            add_arg(child, args[2], "arg3")
            
            instruction_count += 1

        elif opcode in ["LABEL", "JUMP", "CALL"]:
            if len(args) != 1:
                sys.exit(23)

            check_label(args[0])

            add_instruction(root, opcode, instruction_count, args, "label")
            instruction_count += 1

        elif opcode in ["MOVE", "INT2CHAR", "STRLEN", "TYPE", "NOT"]:
            if len(args) != 2:
                sys.exit(23)

            check_var(args[0])

            child = add_instruction(root, opcode, instruction_count, args, "var")

            add_arg(child, args[1], "arg2")
            instruction_count += 1

        elif opcode in ["JUMPIFEQ", "JUMPIFNEQ"]:
            if len(args) != 3:
                sys.exit(23)

            check_label(args[0])

            child = add_instruction(root, opcode, instruction_count, args, "label")

            add_arg(child, args[1], "arg2")
            add_arg(child, args[2], "arg3")

            instruction_count += 1

        elif opcode == "READ":
            if len(args) != 2:
                sys.exit(23)
            check_var(args[0])
            child = add_instruction(root, opcode, instruction_count, args, "var")

            if args[1] not in ["int", "bool", "string"]:
                sys.exit(23)

            arg2 = ET.SubElement(child, "arg2", type="type")
            arg2.text = args[1]
            instruction_count += 1

        elif opcode in ["PUSHS", "WRITE", "EXIT", "DPRINT"]:
            if len(args) != 1:
                sys.exit(23)

            child = ET.SubElement(root, "instruction", order=str(instruction_count), opcode=opcode)
            add_arg(child, args[0], "arg1")
            instruction_count += 1

        #unknown instruction
        else:
            sys.exit(22)
                    
    if instruction_count == 0:
        sys.exit(21)
    
    # Create an ElementTree object with the root element
    tree = ET.ElementTree(root)

    ET.indent(tree)
    tree_str = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    sys.stdout.buffer.write(tree_str)