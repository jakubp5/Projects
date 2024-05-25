#include <stdio.h>
#include <stdlib.h>
#include <semaphore.h>
#include <sys/mman.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <time.h>
#include <string.h>

/*
author: Jakub Pogadl xpogad00
IOS project 2
Barbership Problem
*/

//semaphores
sem_t *mutex;
sem_t *customer;
sem_t  *customerDone;
sem_t *officerDone;
sem_t *queue1;
sem_t *queue2;
sem_t *queue3;

FILE *file;

//shared variables
int *postOpened;
int *q1;
int *q2;
int *q3;
int *file_line;


void customer_process(int id, int randQueue, int randSleep){
    srand(getpid());
    //customer sleeps for a random time before entering post office
    usleep(rand() % (randSleep+1));

    //check if post is opened
    sem_wait(mutex);
        if (*postOpened == 0){
            fprintf(file, "%d: Z: %d going home \n", (*file_line)++, id);
            sem_post(mutex);
            fclose(file);
            exit(0);
        }
    sem_post(mutex);

    //signal that customer entered office
    sem_post(customer);
    
    //customer chooses the queue depending on randomly generated number
    if(randQueue == 1){
        sem_wait(mutex);
            (*q1)++;
            fprintf(file, "%d: Z %d: entering office for a service %d\n", (*file_line)++, id, randQueue);
        sem_post(mutex);
        sem_wait(queue1);
    }
    else if(randQueue == 2){
        sem_wait(mutex);
            (*q2)++;
            fprintf(file, "%d: Z %d: entering office for a service %d\n", (*file_line)++, id, randQueue);
        sem_post(mutex);    
        sem_wait(queue2);
    }
    else if(randQueue == 3){
        sem_wait(mutex);
            (*q3)++;
            fprintf(file, "%d: Z %d: entering office for a service %d\n", (*file_line)++, id, randQueue);
        sem_post(mutex);
        sem_wait(queue3);
    }

    sem_wait(mutex);
        fprintf(file,"%d: Z %d: called by office worker\n", (*file_line)++, id);
    sem_post(mutex);

    sem_post(customerDone);
    sem_wait(officerDone);

    //customer process is finished and he can exit
    sem_wait(mutex);
        fprintf(file, "%d: Z %d: going home\n", (*file_line)++, id);
    sem_post(mutex);
    fclose(file);
    exit(0);
}



void officer_process(int id, int randSleep){
    while(1){
        checkQueue:
        //officer checks if all queues are empty
        if (*q1 == 0 && *q2 == 0 && *q3 == 0){
            //if all queues are empty and post is closed, officer can go home
            sem_wait(mutex);
                if(*postOpened == 0){
                    fprintf(file, "%d: U %d: going home\n", (*file_line)++, id);
                    sem_post(mutex);
                    fclose(file);
                    exit(0);
                }
            sem_post(mutex);
            //if post is still opened, officer takes a break
            sem_wait(mutex);
                fprintf(file, "%d: U %d: taking break\n",(*file_line)++, id);
            sem_post(mutex);

            usleep(rand() % (randSleep+1));

            sem_wait(mutex);
                fprintf(file, "%d: U %d: break finished\n",(*file_line)++, id);
            sem_post(mutex);

            //after break finishes, officer goes back to check queue again
            goto checkQueue;
    }

    //if someone is in a queue, wait for a customer     
    sem_wait(customer);
    int randnum;
    //officer randomly picks a non-empty queue
    while(1){
        randnum = rand() % 3;
        if(randnum == 0 && *q1 > 0){
            (*q1)--;
            sem_post(queue1);
            break;
        }
        else if(randnum == 1 && *q2 > 0){
            (*q2)--;
            sem_post(queue2);
            break;

        }
        else if(randnum == 2 && *q3 > 0){
            (*q3)--;
            sem_post(queue3);
            break;
        }
    }

    sem_wait(customerDone);

    //customer starts serving a customer
    sem_wait(mutex);
        fprintf(file, "%d: U %d: serving a service of type %d\n", (*file_line)++, id, ++randnum);
    sem_post(mutex);
    

    usleep(rand() % 11);
    
    sem_wait(mutex);
        fprintf(file, "%d: U %d: service finished\n", (*file_line)++, id);
    sem_post(mutex);

    //when officer finishes, he goes back to the begining of the function
    sem_post(officerDone);
    }
}

void init(){
    //open file
    file = fopen("proj2.out","w");
    if(file==NULL){
        fprintf(stderr, "Error opening file");
        exit(1);
    }

    //buffering 
    setbuf(file, NULL);

    //initialization of shared variables and semaphores
    mutex = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    customer = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    customerDone = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    officerDone = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    queue1 = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    queue2 = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    queue3 = mmap(NULL, sizeof(sem_t), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    q1 = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    q2 = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    q3 = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    file_line = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
    postOpened = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE, MAP_ANONYMOUS | MAP_SHARED, -1, 0);
     
    *file_line = 1;
    *postOpened = 1;

    //set all semaphores to 0 except for mutex
    sem_init(mutex, 1, 1);
    sem_init(customer, 1, 0);
    sem_init(customerDone, 1, 0);
    sem_init(officerDone, 1, 0);
    sem_init(queue1, 1, 0);
    sem_init(queue2, 1, 0);
    sem_init(queue3, 1, 0);

    //check if MAP was succesful
    if (mutex == MAP_FAILED || customer == MAP_FAILED || customerDone == MAP_FAILED || officerDone == MAP_FAILED || queue1 == MAP_FAILED || queue2 == MAP_FAILED || queue3 == MAP_FAILED || q1 == MAP_FAILED || q2 == MAP_FAILED || q3 == MAP_FAILED || postOpened == MAP_FAILED){
        fprintf(stderr, "Error in mmap");
        exit(1);
    }
}


//free all resources
void cleanup(){
    //destroy semaphores
    sem_destroy(mutex);
    sem_destroy(officerDone);
    sem_destroy(customer);
    sem_destroy(customerDone);
    sem_destroy(queue1);
    sem_destroy(queue2);
    sem_destroy(queue3);

    //remove shared vaariables from memory
    munmap(mutex, sizeof (sem_t));
    munmap(officerDone, sizeof (sem_t));
    munmap(customer, sizeof (sem_t));
    munmap(customerDone, sizeof (sem_t));
    munmap(queue1, sizeof (sem_t));
    munmap(queue2, sizeof (sem_t));
    munmap(queue3, sizeof (sem_t));
    munmap(file_line, sizeof(int));
    munmap(q1, sizeof(int));
    munmap(q2, sizeof(int));
    munmap(q3, sizeof(int));
    munmap(postOpened, sizeof(int));

    //close file
    fclose(file);
}


int main(int argc, char *argv[])
{
    //check if correct amount of args was inputted
    if (argc != 6){
        fprintf(stderr, "Incorrect number of arguments\n");
        return 1;
    }

    //check if args are ints
    char *nz, *nu, *tz, *tu, *f;
    int NZ = strtol(argv[1], &nz, 10); //number of customers
    int NU = strtol(argv[2], &nu, 10); //number of officers
    int TZ = strtol(argv[3], &tz, 10); //max wait time for customer before he enters office
    int TU = strtol(argv[4], &tu, 10); //max break time for officer
    int F = strtol(argv[5], &f, 10);   //max time until post office closes

    if (*nz != '\0' || *nu != '\0' || *tz != '\0' || *tu != '\0' || *f != '\0'){
        fprintf(stderr, "Incorrect arguments, input integers only\n");
        return 1;
    }

    if(!((TZ >= 0 && TZ <= 10000) && (TU >= 0 && TU <= 100) && (F >= 0 && F <= 10000))){
        fprintf(stderr, "Incorrect interval of arguments\n");
        return 1;
    }
    
    //multiply given time frames by 1000, because of usleep
    TZ *= 1000;
    TU *= 1000;
    F *= 1000;  
    
    //initialize
    init();

    //create one process for post, where timer for its closing will begin
    pid_t postoffice = fork();
    if (postoffice == 0){
        srand(getpid());
        if (F == 0){
            usleep(0);
        }
        else{
            usleep(((rand() % F) + F));
        }        
        sem_wait(mutex);
            fprintf(file, "%d: closing\n", (*file_line)++);
            *postOpened = 0;
        sem_post(mutex);
        fclose(file);
        exit(0);
    }

    // create officers
    for (int i = 0; i < NU; i++){
        pid_t id = fork();
        if (id == 0){
            srand(getpid());

            sem_wait(mutex);
                fprintf(file, "%d: U %d: started\n", (*file_line)++, ++i);
            sem_post(mutex);

            officer_process(i, TU);
            fclose(file);
            exit(0);
        }
    }
    // create customers
    for (int i = 0; i < NZ; i++){
        pid_t id = fork();
        if (id == 0){
            srand(getpid());
            //generate random queue
            int randQueue = (rand() % 3);

            sem_wait(mutex);
                fprintf(file, "%d: Z %d: started\n", (*file_line)++, ++i);
            sem_post(mutex);

            customer_process(i, ++randQueue, TZ);
            fclose(file);
            exit(0);
        }
    }

    //wait for all processes to finish
    while (wait(NULL) > 0);

    //free all allocated resources   
    cleanup();

    return 0;   
}