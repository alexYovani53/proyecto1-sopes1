
#include <linux/module.h>
#include <linux/init.h>
#include <linux/proc_fs.h>
#include <linux/fs.h>
#include <linux/sysinfo.h>
#include <linux/seq_file.h>
#include <linux/swap.h>


    unsigned long memoriaLibre;
    unsigned long memoriaTotal;
    unsigned long disponible;
    unsigned long resta;
    unsigned long usage;
    
static int meminfo_proc_show( struct seq_file *flujo , void *v ){

    struct sysinfo i;
    
    unsigned long pages[NR_LRU_LISTS];
    int lru;
#define K(x) ((x) << (PAGE_SHIFT - 10))
    si_meminfo(&i); 

    memoriaTotal = (K(i.totalram) /1024);
    memoriaLibre = (K(i.freeram ) /1024);
    usage =(((K(i.totalram)-K(i.freeram))/1024)*100 )/ (K(i.totalram)/1024);
    disponible = (K(si_mem_available())/1024);
    resta = (K(i.totalswap)/1024);

    seq_printf(flujo,"{");
    seq_printf(flujo,"\t\"descripcion\":\"Seminario de sistemas 1 - 2s - 2021\",\n");
    seq_printf(flujo,"\t\"data\":[\n");
    seq_printf(flujo,"\t\t {\n");
    seq_printf(flujo,"\t\t\"Memo_total\":%8lu,\n",memoriaTotal);
    seq_printf(flujo,"\t\t\"Memo_libre\":%8lu,\n",memoriaLibre);
    seq_printf(flujo,"\t\t\"Memo_available\":%8lu,\n",disponible);
    seq_printf(flujo,"\t\t\"Memo_usada\":%8lu,\n",(memoriaTotal-memoriaLibre));
    seq_printf(flujo,"\t\t\"Memo_usada_por\":%8lu\n",usage);
    seq_printf(flujo,"\t\t}\n");  
    seq_printf(flujo,"\t]\n");
    seq_printf(flujo,"}\n");
#undef K
    return 0;
}


static int al_abrir(struct inode *inode,struct file *file){
    return single_open(file,meminfo_proc_show,NULL);
}

static ssize_t write_proc(struct file *file, const char __user *bufer, size_t count, loff_t *offp){
    return 0;
}

static struct proc_ops operaciones = {
    .proc_open = al_abrir,
    .proc_read = seq_read,
    .proc_write = write_proc
};

static int __init iniciar_init(void){
    printk(KERN_INFO "modulo kernel ram");

    proc_create("memoria_ram___201602912",0777,NULL,&operaciones);

    return 0;
}

static void __exit salir_exit(void){
    printk(KERN_INFO "Sistemas Operativos 1 - p1\n");
    remove_proc_entry("memoria_ram___201602912",NULL);
}


module_init(iniciar_init);
module_exit(salir_exit);




MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("MODULO RAM - INFORMACION DE USO");
MODULE_AUTHOR("ALEX JERONIMO  - 201602912");


