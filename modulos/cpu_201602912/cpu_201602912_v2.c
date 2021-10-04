#include <linux/module.h> 
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/fs.h>
#include <linux/seq_file.h>
#include <linux/proc_fs.h>
#include <asm/uaccess.h> 
#include <linux/hugetlb.h>
#include <linux/sched/signal.h>

#include <linux/smp.h>     // get_cpu(), put_cpu()
#include <linux/cpufreq.h> // cpufreq_get()
#include <linux/cpumask.h> // cpumask_{first,next}(), cpu_online_mask

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("MODULO CPU - INFORMACION DE USO");
MODULE_AUTHOR("ALEX JERONIMO  - 201602912");

struct task_struct  *task;          //info de un proceso
struct task_struct  *task_child;    /*    Structure needed to iterate through task children    */
struct list_head    *list;          /*    Structure needed to iterate through the list in each task->children struct    */
 
int contador= 0;
int corriendo = 0;
int detenido=0;
int interrumpible=0;
int no_interumpible=0;
int zombie=0;
int otro = 0;
unsigned cpu =0;


static void contando(long state, bool sumarTipo){

    switch (state)
    {
    case TASK_RUNNING:
        if(sumarTipo)corriendo+=1;
        break;
    case TASK_STOPPED:
        if(sumarTipo)detenido+=1;
        break;
    case TASK_INTERRUPTIBLE:
        if(sumarTipo)interrumpible+=1;
        break;
    case TASK_UNINTERRUPTIBLE:
        if(sumarTipo)no_interumpible+=1;
        break;
    case EXIT_ZOMBIE:
        if(sumarTipo)zombie+=1;
        break;

    default:
        if(sumarTipo)otro+=1;
        break;
    }
}

static int escribir_cont_cpu( struct seq_file *flujo , void *v ){
    
contador= 0;
corriendo = 0;
detenido=0;
interrumpible=0;
no_interumpible=0;
zombie=0;
otro = 0;
cpu = 0;

    for_each_process( task ){            /*    for_each_process() MACRO for iterating through each task in the os located in linux\sched\signal.h    */
        // seq_printf(flujo, "{\"PADRE\": %d , \"PID\": %d , \"NOMBRE\": \"%s\" , \"STADO\": %ld }\n",task->pid,task->pid, task->comm, task->state);/*    log parent id/executable name/state    */
        list_for_each(list, &task->children){                        /*    list_for_each MACRO to iterate through task->children    */
 
            task_child = list_entry( list, struct task_struct, sibling );    /*    using list_entry to declare all vars in task_child struct    */
     
            // seq_printf(flujo, "{\"PADRE\": %d , \"PID\": %d , \"NOMBRE\": \"%s\" , \"STADO\": %ld }\n",task->pid, /*    log child of and child pid/name/state    */
            //     task_child->pid, task_child->comm, task_child->state);

            contando(task_child->state,false);

            // contador = contador + 1;
        }

        contando(task->state,true);
        contador = contador + 1;
        
    }   
    seq_printf(flujo,"\"procesos\": %d ,\n",contador) ;
    seq_printf(flujo,"\"corriendo\": %d,\n\"detenido\":%d,\n\"interrumpible\":%d,\n\"no_interrumpible\":%d,\n\"zombie\":%d,\n\"otro\":%d\ns",corriendo,detenido,interrumpible,no_interumpible,zombie,otro);


    cpu = cpumask_first(cpu_online_mask);

        while (cpu < nr_cpu_ids) {
                seq_printf(flujo,"CPU: %u, freq: %u kHz\n %u", cpu, cpufreq_get(cpu),cpufreq_quick_get_max(cpu));
                cpu = cpumask_next(cpu, cpu_online_mask);
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

    proc_create("memoria_cpu____201602912",0777,NULL,&operaciones);
    return 0;
}

static void __exit salir_exit(void){
    printk(KERN_INFO "Sistemas Operativos 1 - p1\n");
    remove_proc_entry("memoria_cpu____201602912",NULL);
}


module_init(iniciar_init);
module_exit(salir_exit);

