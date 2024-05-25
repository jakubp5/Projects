/**
 * Kostra programu pro 2. projekt IZP 2022/23
 * Author: Jakub Pogádl
 * xlogin: xpogad00
 * date: 12.4.2022
 * Jednoducha shlukova analyza: 2D nejblizsi soused.
 * Single linkage
 */
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <math.h> // sqrtf
#include <limits.h> 

/*****************************************************************
 * Ladici makra. Vypnout jejich efekt lze definici makra
 * NDEBUG, napr.:
 *   a) pri prekladu argumentem prekladaci -DNDEBUG
 *   b) v souboru (na radek pred #include <assert.h>
 *      #define NDEBUG
 */
#ifdef NDEBUG
#define debug(s)
#define dfmt(s, ...)
#define dint(i)
#define dfloat(f)
#else

// vypise ladici retezec
#define debug(s) printf("- %s\n", s)

// vypise formatovany ladici vystup - pouziti podobne jako printf
#define dfmt(s, ...) printf(" - "__FILE__":%u: "s"\n",__LINE__,__VA_ARGS__)

// vypise ladici informaci o promenne - pouziti dint(identifikator_promenne)
#define dint(i) printf(" - " __FILE__ ":%u: " #i " = %d\n", __LINE__, i)

// vypise ladici informaci o promenne typu float - pouziti
// dfloat(identifikator_promenne)
#define dfloat(f) printf(" - " __FILE__ ":%u: " #f " = %g\n", __LINE__, f)

#endif

/*****************************************************************
 * Deklarace potrebnych datovych typu:
 *
 * TYTO DEKLARACE NEMENTE
 *
 *   struct obj_t - struktura objektu: identifikator a souradnice
 *   struct cluster_t - shluk objektu:
 *      pocet objektu ve shluku,
 *      kapacita shluku (pocet objektu, pro ktere je rezervovano
 *          misto v poli),
 *      ukazatel na pole shluku.
 */

struct obj_t {
    int id;
    float x;
    float y;
};

struct cluster_t {
    int size;
    int capacity; 
    struct obj_t *obj; //array of objects
};

/*****************************************************************
 * Deklarace potrebnych funkci.
 *
 * PROTOTYPY FUNKCI NEMENTE
 *
 * IMPLEMENTUJTE POUZE FUNKCE NA MISTECH OZNACENYCH 'TODO'
 *
 */

/*
 Inicializace shluku 'c'. Alokuje pamet pro cap objektu (kapacitu).
 Ukazatel NULL u pole objektu znamena kapacitu 0.
*/
void init_cluster(struct cluster_t *c, int cap)
{
    assert(c != NULL);
    assert(cap >= 0);

    c->capacity = cap;
    c->size = 0;
    //alocates array of objects and returns in case of an error
    c->obj = malloc(cap*sizeof(struct obj_t));
    if (c->obj == NULL)
    {
        fprintf(stderr,"Error while allocating memory\n");
        return;
    }
}

/*
 Odstraneni vsech objektu shluku a inicializace na prazdny shluk.
 */
void clear_cluster(struct cluster_t *c)
{
    c->size = 0;
    c->capacity = 0;
    free(c->obj);
    c->obj = NULL;
}

/// Chunk of cluster objects. Value recommended for reallocation.
const int CLUSTER_CHUNK = 10;

/*
 Zmena kapacity shluku 'c' na kapacitu 'new_cap'.
 */
struct cluster_t *resize_cluster(struct cluster_t *c, int new_cap)
{
    // TUTO FUNKCI NEMENTE
    assert(c);
    assert(c->capacity >= 0);
    assert(new_cap >= 0);

    if (c->capacity >= new_cap)
        return c;

    size_t size = sizeof(struct obj_t) * new_cap;

    void *arr = realloc(c->obj, size);
    if (arr == NULL)
        return NULL;

    c->obj = (struct obj_t*)arr;
    c->capacity = new_cap;
    return c;
}

/*
 Prida objekt 'obj' na konec shluku 'c'. Rozsiri shluk, pokud se do nej objekt
 nevejde.
 */
void append_cluster(struct cluster_t *c, struct obj_t obj)
{ 
    if(c->size < c->capacity)
    {
        c->obj[c->size] = obj;
        c->size++;
    }
    else{
        //cluster_chunk is set to 10 so it doesnt have to resize everytime, which increases performance
        resize_cluster(c, c->capacity + CLUSTER_CHUNK); 
        c->obj[c->size] = obj;
        c->size++;
    }
}

/*
 Seradi objekty ve shluku 'c' vzestupne podle jejich identifikacniho cisla.
 */
void sort_cluster(struct cluster_t *c);

/*
 Do shluku 'c1' prida objekty 'c2'. Shluk 'c1' bude v pripade nutnosti rozsiren.
 Objekty ve shluku 'c1' budou serazeny vzestupne podle identifikacniho cisla.
 Shluk 'c2' bude nezmenen.
 */
void merge_clusters(struct cluster_t *c1, struct cluster_t *c2)
{
    assert(c1 != NULL);
    assert(c2 != NULL);

    for (int i = 0; i < c2->size; i++)
    {
        append_cluster(c1, c2->obj[i]);
    }
    sort_cluster(c1);
}

/**********************************************************************/
/* Prace s polem shluku */

/*
 Odstrani shluk z pole shluku 'carr'. Pole shluku obsahuje 'narr' polozek
 (shluku). Shluk pro odstraneni se nachazi na indexu 'idx'. Funkce vraci novy
 pocet shluku v poli.
*/
int remove_cluster(struct cluster_t *carr, int narr, int idx)
{
    assert(idx < narr);
    assert(narr > 0);

    clear_cluster(&carr[idx]);
    for (int i = idx; i < narr-1; i++)
    {
        carr[i]=carr[i+1];
    }
    return narr-1; 
}       

/*
 Pocita Euklidovskou vzdalenost mezi dvema objekty.
 */
float obj_distance(struct obj_t *o1, struct obj_t *o2)
{
    assert(o1 != NULL);
    assert(o2 != NULL);

    float x = pow((o1->x - o2->x), 2);
    float y = pow((o1->y - o2->y), 2);
    return sqrtf(x + y);
}

/*
 Pocita vzdalenost dvou shluku.
*/
float cluster_distance(struct cluster_t *c1, struct cluster_t *c2)
{
    assert(c1 != NULL);
    assert(c1->size > 0);
    assert(c2 != NULL);
    assert(c2->size > 0);

    float min = __FLT_MAX__;
    float tmp_distance;
    
    for (int i = 0; i < c1->size; i++)
        {
            for (int j = 0; j < c2->size; j++)
            {
                tmp_distance = obj_distance(&(c1->obj[i]), &(c2->obj[j]));
                if (tmp_distance < min)
                {
                    min = tmp_distance;
                }
                    
        }
    }
    
    return min;
}

/*
 Funkce najde dva nejblizsi shluky. V poli shluku 'carr' o velikosti 'narr'
 hleda dva nejblizsi shluky. Nalezene shluky identifikuje jejich indexy v poli
 'carr'. Funkce nalezene shluky (indexy do pole 'carr') uklada do pameti na
 adresu 'c1' resp. 'c2'.
*/
void find_neighbours(struct cluster_t *carr, int narr, int *c1, int *c2)
{
    assert(narr > 0);

    float min = __FLT_MAX__;
    float tmp_distance;

    for (int i = 0; i < narr; i++)
    {
        for (int j = i + 1; j < narr; j++)
        {
            tmp_distance = cluster_distance(&carr[i], &carr[j]);
            if (min > tmp_distance)
            {
                min = tmp_distance;
                *c1 = i;
                *c2 = j; 
            }   
        }
    }
}

// pomocna funkce pro razeni shluku
static int obj_sort_compar(const void *a, const void *b)
{
    // TUTO FUNKCI NEMENTE
    const struct obj_t *o1 = (const struct obj_t *)a;
    const struct obj_t *o2 = (const struct obj_t *)b;
    if (o1->id < o2->id) return -1;
    if (o1->id > o2->id) return 1;
    return 0;
}

/*
 Razeni objektu ve shluku vzestupne podle jejich identifikatoru.
*/
void sort_cluster(struct cluster_t *c)
{
    // TUTO FUNKCI NEMENTE
    qsort(c->obj, c->size, sizeof(struct obj_t), &obj_sort_compar);
}

/*
 Tisk shluku 'c' na stdout.
*/
void print_cluster(struct cluster_t *c)
{
    // TUTO FUNKCI NEMENTE
    for (int i = 0; i < c->size; i++)
    {
        if (i) putchar(' ');
        printf("%d[%g,%g]", c->obj[i].id, c->obj[i].x, c->obj[i].y);
    }
    putchar('\n');
}


/*
 Ze souboru 'filename' nacte objekty. Pro kazdy objekt vytvori shluk a ulozi
 jej do pole shluku. Alokuje prostor pro pole vsech shluku a ukazatel na prvni
 polozku pole (ukalazatel na prvni shluk v alokovanem poli) ulozi do pameti,
 kam se odkazuje parametr 'arr'. Funkce vraci pocet nactenych objektu (shluku).
 V pripade nejake chyby uklada do pameti, kam se odkazuje 'arr', hodnotu NULL.
*/
int load_clusters(char *filename, struct cluster_t **arr)
{
    
    assert(arr != NULL);

    //holds the value of the first line from the file
    int count = 0;

    //pointer to file
    FILE* file; 
    file = fopen(filename, "r");
    if (file == NULL)
    {
        fprintf(stderr,"Error while opening a file\n");
        return -1;
    }

    //looks for count=x in file
    int count_load = fscanf(file, "count=%d", &count);
    //checks if count_load was successful
    if (count_load != 1)
    {
        fprintf(stderr,"Error while loading count=x in file\n");
        fclose(file);
        return -1;
    }

    //check if count is a natural number
    if (count < 1)
    {
        fprintf(stderr,"Count is less than 0\n");
        fclose(file);
        return -1;
    }
    
    //allocates memory
    *arr = malloc(sizeof(struct cluster_t) * count);
    if (*arr == NULL)
    {
        fprintf(stderr, "Error while allocating memory\n");
        return -1;
    }

    for (int i = 0; i < count; i++){
        //declaration of test variables for checking data from file
        int test_id, test_x, test_y;

        //initializes cluster on index i of capacity 1
        init_cluster(&(*arr)[i], 1);

        //should return 3 if everything was loaded
        int successful_loads = fscanf(file,"%d %d %d", &test_id, &test_x, &test_y);  

        //checks for error while scanning ID,X,Y
        if (successful_loads != 3)
        {   
            for (int j = 0; j <= i; j++)
            {
                clear_cluster(&(*arr)[j]);
            }
            fprintf(stderr,"Error while loading\n");
            fclose(file);
            free(*arr);
            return -1;
        }

        //checks if points are in interval <0, 1000>
        if ((test_x >= 1000 || test_x <= 0) || (test_y >= 1000 || test_y <= 0))
        {
             for (int j = 0; j <= i; j++)
            {
                clear_cluster(&(*arr)[j]);
            }
            fprintf(stderr,"Incorrect dimensions\n");
            fclose(file);
            free(*arr);
            return -1;
        }

        //stores variables and increases size by one
        (*arr)[i].obj->id = test_id;
        (*arr)[i].obj->x = test_x;
        (*arr)[i].obj->y = test_y;
        (*arr)[i].size++;
    }

    //checks for ID duplicity
    for (int i = 0; i < count - 1; i++) 
    {
        for (int j = i + 1; j < count; j++)
        {
            if ((*arr)[i].obj->id == (*arr)[j].obj->id)
            {
                for (int k = 0; k < count; k++)
                {
                    clear_cluster(&(*arr)[k]);
                }
                fclose(file);
                free(*arr);
                fprintf(stderr,"Duplicate ID\n");
                return -1;
            }
        }
    }
    
    fclose(file);
    return count;
}

/*
 Tisk pole shluku. Parametr 'carr' je ukazatel na prvni polozku (shluk).
 Tiskne se prvnich 'narr' shluku.
*/
void print_clusters(struct cluster_t *carr, int narr)
{
    printf("Clusters:\n");
    for (int i = 0; i < narr; i++)
    {
        printf("cluster %d: ", i);
        print_cluster(&carr[i]);
    }
}

int main(int argc, char *argv[])
{
    struct cluster_t *clusters; //array of clusters
    int user_input; //holds the amount of clusters user wants to end up with, is defaultly set to one if no arg is present
    int cluster_amount; //amount of clusters loaded from the file

    //if no input present end program
    if (argc == 1)
    {
        fprintf(stderr,"No input\n");
        return 1;
    }

    //if no number was entered assume user_input = 1
    if (argc == 2)
    {
        user_input = 1;
    }

    //store argv[2] into user_input
    else if (argc == 3)
    {
        char *p;
        //converts string to int
        user_input = strtol(argv[2], &p, 10);
        //if p isnt empty, conversion wasn't succesful
        if (*p != '\0')
        {
            fprintf(stderr,"Input isn't an integer\n");
            return 1;
        } 
    }   

    else
    {
        fprintf(stderr,"Incorrect input\n");
        return 1;
    }

    if (user_input <= 0)
    {
        fprintf(stderr, "Inputted number is less than, or equal to zero \n");
    }

    //cluster_amount holds the number of loaded clusters
    cluster_amount = load_clusters(argv[1], &clusters);

    //check if load was successful
    if (cluster_amount == -1)
    {
        //fprintf(stderr,"Erron in load_clusters\n");
        return 1;
    }

    if (user_input > cluster_amount)
    {
        fprintf(stderr,"Inputted number is larger than the amount of clusters in file\n");
        for (int i = 0; i < cluster_amount; i++)
        {
            clear_cluster(&clusters[i]);
        }
        free(clusters);
        return 1;
    }

    //main loop
    while (cluster_amount != user_input) 
    {   
        //c1,c2 represent indexes, where objects from c2 go to c1 and c2 is removed from the array of clusters
        int c1, c2;
        find_neighbours(clusters, cluster_amount, &c1, &c2);
        merge_clusters(&clusters[c1], &clusters[c2]);
        cluster_amount = remove_cluster(clusters, cluster_amount, c2);
    }

    //prints remaining clusters to stdout
    print_clusters(clusters, cluster_amount);

    //free memory
    for (int i = 0; i < cluster_amount; i++)
    {
        clear_cluster(&clusters[i]);
    }
    free(clusters);

    return 0;    
}

