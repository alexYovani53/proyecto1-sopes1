#include <linux/module.h> 
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/list.h>
#include <linux/types.h>
#include <linux/slab.h>
#include <linux/sched.h>
#include <linux/string.h>
#include <linux/fs.h>
#include <linux/seq_file.h>
#include <linux/proc_fs.h>
#include <asm/uaccess.h> 
#include <linux/hugetlb.h>
#include <linux/sched/signal.h>


MODULE_LICENSE("GLP");
MODULE_DESCRIPTION("MODULO CPU - INFORMACION DE USO");
MODULE_AUTHOR("ALEX JERONIMO  - 201602912");

struct task_struct  *task;          //info de un proceso
struct task_struct  *task_child;    /*    Structure needed to iterate through task children    */
struct list_head    *list;          /*    Structure needed to iterate through the list in each task->children struct    */
 
static int escribir_cont_cpu( struct seq_file *flujo , void *v ){
    
    for_each_process( task ){            /*    for_each_process() MACRO for iterating through each task in the os located in linux\sched\signal.h    */
        seq_printf(flujo, "{\"PADRE\": %d , \"PID\": %d , \"NOMBRE\": \"%s\" , \"STADO\": %ld }\n",task->pid,task->pid, task->comm, task->state);/*    log parent id/executable name/state    */
        list_for_each(list, &task->children){                        /*    list_for_each MACRO to iterate through task->children    */
 
            task_child = list_entry( list, struct task_struct, sibling );    /*    using list_entry to declare all vars in task_child struct    */
     
            seq_printf(flujo, "{\"PADRE\": %d , \"PID\": %d , \"NOMBRE\": \"%s\" , \"STADO\": %ld }\n",task->pid, /*    log child of and child pid/name/state    */
                task_child->pid, task_child->comm, task_child->state);
        }
        
    }    
    return 0;
}


static int al_abrir(struct inode *inode,struct file *file){
    return single_open(file,escribir_cont_cpu,NULL);
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

    printk(KERN_INFO "modulo kernel cpu");

    proc_create("memoria_cpu___201602912",0777,NULL,&operaciones);
    return 0;
}

static void __exit salir_exit(void){
    printk(KERN_INFO "Sistemas Operativos 1 - p1\n");
    remove_proc_entry("memoria_cpu___201602912",NULL);
}


module_init(iniciar_init);
module_exit(salir_exit);

