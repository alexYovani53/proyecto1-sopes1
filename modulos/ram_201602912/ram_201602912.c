#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/proc_fs.h>
#include <linux/sched.h>
#include <linux/uaccess.h>
#include <linux/slab.h>
#include <linux/fs.h>
#include <linux/sysinfo.h>
#include <linux/seq_file.h>
#include <linux/slab.h>
#include <linux/mm.h>
#include <linux/swap.h>


MODULE_LICENSE("GLP");
MODULE_DESCRIPTION("MODULO RAM - INFORMACION DE USO");
MODULE_AUTHOR("ALEX JERONIMO  - 201602912");



struct sysinfo i;

    long memoriaLibre;
    long memoriaTotal;

static int escribir_cont_ram( struct seq_file *flujo , void *v ){
    
    si_meminfo(&i);
    

    memoriaTotal = (i.totalram * 4);
    memoriaLibre = (i.freeram * 4);


    seq_printf(flujo,"{\n");
    seq_printf(flujo,"\t\"descripcion\":\"Seminario de sistemas 1 - 2s - 2021\",\n");
    seq_printf(flujo,"\t\"data\":[\n");
    seq_printf(flujo,"\t\t {\n");
    seq_printf(flujo,"\t\t\"Memo_total\":\" %8lu MB \",\n",memoriaTotal);
    seq_printf(flujo,"\t\t\"Memo_libre\":\" %8lu MB \",\n",memoriaLibre);
    seq_printf(flujo,"\t\t\"Memo_usada\":\" %8lu %% MB \",\n",((memoriaTotal-memoriaLibre)*100)/memoriaTotal);
    seq_printf(flujo,"\t\t}\n");  
    seq_printf(flujo,"\t]\n");
    seq_printf(flujo,"}\n");

    return 0;
}


static int al_abrir(struct inode *inode,struct file *file){
    return single_open(file,escribir_cont_ram,NULL);
}

static ssize_t write_proc(struct file *file, const char __user *bufer, size_t count, loff_t *offp){
    return 0;
}

static struct file_operations operaciones = {
    .owner = THIS_MODULE,
    .open = al_abrir,
    .read = seq_read,
    .write = write_proc,
    .release = single_release,
    .llseek = seq_lseek
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



