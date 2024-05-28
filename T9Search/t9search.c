//Jakub Pogadl, xpogad00
//t9search IZP projekt

#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

#define MAX 102
int findMatch(char name[], char inputNum[], int lengthInputNum){
    char keyMap [10][5] = {"0+", "1", "2abc", "3def", "4ghi", "5jkl", "6mno", "7pqrs", "8tuv", "9wxyz"};
    int matchCounter = 0;
    int currentNumCounter = 0; //holds the place of the digit of inputNum

    for (int i = 0; name[i] != '\0'; i++){ //loop goes through every letter in name
    
        /*if (name[i] == ' ') //if char is space, increase index by one
            i++;*/
        name[i] = tolower(name[i]);
        
        for (int j = 0; j < 5; j++){ //loop goes through every char in keyMap

            //converts char to int so it can be used for indexing
            char currentNum = inputNum[currentNumCounter];
            int intCurrentNum = currentNum - '0';
                        
            if (name[i] == keyMap[intCurrentNum][j])
            {
                matchCounter++;     
                currentNumCounter++; //go to the next digit
                if (matchCounter == lengthInputNum) 
                    return 1;
                break;
            }
            
            if (j == 4 && matchCounter > 0) //if no consecutive match
            {   
                i -= matchCounter; //try the same letter with the first digit again
                matchCounter = 0; //reset the match counter
                currentNumCounter = 0; //come back to the first digit
            }
        }
    }
    return 0; 
}

//function to print all of the contacts
void printAll(){ 
    char name[MAX];
    char number[MAX];

    while (fgets(name, MAX, stdin)){
        fgets(number, MAX, stdin);
        if (strlen(name) == 101 || strlen(number) == 101){
            fprintf(stderr, "Invalid data\n");
            return; 
        }
        name[strlen(name)-1] = '\0';
        printf("%s, %s", name, number);
    }
    return;
}

int checkForLetter(char inputNum[]){
    for (int i = 0; inputNum[i] != '\0'; i++){
        if (!isdigit(inputNum[i])){
            return 1;
        }
    }
    return 0;
}

int main(int argc, char *argv[]){    

    if (argc >= 3){
        fprintf(stderr, "Incorrect input\n");
        return 1;
    }

    if (argc == 1){
        printAll();
        return 0;
    }
    
    char inputNum[MAX]; 
    strcpy(inputNum, argv[1]); 
    
    int containsLetter = checkForLetter(inputNum);
    if (containsLetter)
    {
        fprintf(stderr, "Incorrect input");
        return 1;
    }

    int lengthInputNum = strlen(inputNum);

    //declaration of arrays used for storing lines from the file
    char name[MAX]; 
    char number[MAX];
    //declaration of arrays used for storing copies
    char nameCopy[MAX];
    char numberCopy[MAX];
    
    int foundContacts = 0;

    while (fgets(name, MAX, stdin)){ //loading lines into the arrays
        fgets(number, MAX, stdin);

        //if line is bigger than 100 chars invalid data
        if (strlen(name) == 101 || strlen(number) == 101){
            fprintf(stderr, "Invalid data\n");
            return 1;
        }
    
        strcpy(nameCopy, name);
        strcpy(numberCopy, number);
    
        nameCopy[strlen(nameCopy)-1] = '\0'; //replaces linebreak character with null character
        strcat(name, number); //put name and number into one string

        int foundMatch = findMatch(name, inputNum, lengthInputNum);
        if (foundMatch){
            printf("%s, %s", nameCopy, numberCopy);
            foundContacts++;    
        }
    }

    if (foundContacts == 0){
        printf("Not found\n");
    }
    return 0;
}
