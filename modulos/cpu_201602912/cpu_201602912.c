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
#include <linux/kernel_stat.h>


#include <linux/tick.h>
#include <linux/delay.h>

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
unsigned int f[2];

//Metodos obtenidos de stat.c
static u64 get_idle_time(int cpu)
{
	u64 idle, idle_time = -1ULL;

	if (cpu_online(cpu))
		idle_time = get_cpu_idle_time_us(cpu, NULL);

	if (idle_time == -1ULL)
		idle = kcpustat_cpu(cpu).cpustat[CPUTIME_IDLE];
	else
		idle = nsecs_to_jiffies64(idle_time);

	return idle;
}

//Metodos obtenidos de stat.c
static u64 get_iowait_time(int cpu)
{
	u64 iowait, iowait_time = -1ULL;

	if (cpu_online(cpu))
		iowait_time = get_cpu_iowait_time_us(cpu, NULL);

	if (iowait_time == -1ULL)
		iowait = kcpustat_cpu(cpu).cpustat[CPUTIME_IOWAIT];
	else
		iowait = nsecs_to_jiffies64(iowait_time);

	return iowait;
}


static int cpu_stat_show(struct seq_file *m, void *v){
    int i;
    u64 Total = 0;
	unsigned long long total_jiffies_1, total_jiffies_2;
	unsigned long long work_jiffies_1, work_jiffies_2;
	unsigned int work_over_period, total_over_period;
	unsigned int usage;

    u64 user, nice, system, idle, iowait, irq, softirq, steal;
 	u64 guest, guest_nice;
    
    user = nice = system = idle = iowait = irq = softirq = steal = 0;
	guest = guest_nice = 0;
    //recorremos todos los cpus y sumamos sus procesos
    for_each_possible_cpu(i) {
		user += kcpustat_cpu(i).cpustat[CPUTIME_USER];
		nice += kcpustat_cpu(i).cpustat[CPUTIME_NICE];
		system += kcpustat_cpu(i).cpustat[CPUTIME_SYSTEM];
		idle += get_idle_time(i);
		iowait += get_iowait_time(i);
		irq += kcpustat_cpu(i).cpustat[CPUTIME_IRQ];
		softirq += kcpustat_cpu(i).cpustat[CPUTIME_SOFTIRQ];
		steal += kcpustat_cpu(i).cpustat[CPUTIME_STEAL];
		guest += kcpustat_cpu(i).cpustat[CPUTIME_GUEST];
		guest_nice += kcpustat_cpu(i).cpustat[CPUTIME_GUEST_NICE];
	}
    Total = user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
	work_jiffies_1 = jiffies_64_to_clock_t(user+nice+system);
	total_jiffies_1 = jiffies_64_to_clock_t(Total);
    //delay para obtener otra medicion
	mdelay(200);
	user = nice = system = idle = iowait = irq = softirq = steal = 0;
	guest = guest_nice = 0;
    for_each_possible_cpu(i) {
		user += kcpustat_cpu(i).cpustat[CPUTIME_USER];
		nice += kcpustat_cpu(i).cpustat[CPUTIME_NICE];
		system += kcpustat_cpu(i).cpustat[CPUTIME_SYSTEM];
		idle += get_idle_time(i);
		iowait += get_iowait_time(i);
		irq += kcpustat_cpu(i).cpustat[CPUTIME_IRQ];
		softirq += kcpustat_cpu(i).cpustat[CPUTIME_SOFTIRQ];
		steal += kcpustat_cpu(i).cpustat[CPUTIME_STEAL];
		guest += kcpustat_cpu(i).cpustat[CPUTIME_GUEST];
		guest_nice += kcpustat_cpu(i).cpustat[CPUTIME_GUEST_NICE];
	}
    Total = user + nice + system + idle + iowait + irq + softirq + steal + guest + guest_nice;
	work_jiffies_2 = jiffies_64_to_clock_t(user+nice+system);
	total_jiffies_2 = jiffies_64_to_clock_t(Total);

	work_over_period = work_jiffies_2-work_jiffies_1;
	total_over_period = total_jiffies_2-total_jiffies_1;
	usage = work_over_period*100/total_over_period;

	
	seq_printf(m, "\"CPU\":\"%d%%\"",usage);
    return 0;
}

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

    for_each_process( task ){       
        list_for_each(list, &task->children){                   
 
            task_child = list_entry( list, struct task_struct, sibling );   
            contando(task_child->state,false);
        }
        contando(task->state,true);
        contador = contador + 1;        
    }   

    seq_printf(flujo,"{\n");
    seq_printf(flujo,"\"procesos\": %d ,",contador) ;
    seq_printf(flujo,"\"corriendo\": %d,\"detenidos\":%d,\"interrumpible\":%d,\"no_interrumpible\":%d,\"zombie\":%d,\"otro\":%d",corriendo,detenido,interrumpible,no_interumpible,zombie,otro);
    seq_printf(flujo,",");
    cpu_stat_show(flujo,v);
    seq_printf(flujo,"}");
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

