# ACFS REPLICATION

In this test we are going to test ACFS Replication feature using FSMultiThread workload. Oracle ACFS replication enables replication of Oracle ACFS file systems across the network to a remote site, providing disaster recovery capability for the file system.


## HOW WE WILL TEST

We will be testing REPLICATION fature with FSMultiThread workload. First we will verify the necessary condition that is required to run the test , remove unnecessary things that will block the test. Then initalize the replication on both primary and standby cluster. After that we will run FSMultiThread workload on all the primary node. After that will will stop the workload if required ,terminate the replication and check for logs for any undesired result.


### FSMultiThread workload

FSMultiThreadTest is a scalable system/stress test written as a multithreaded C application. The test performs four different types of filesystem tests and supports two test modes. The first mode is the system call mode in which all Linux system calls for filesystem are used to perform I/O on the files. In the second mode called the library mode, all library calls avilable in POSIX and GNU C libraries are used to perform I/O to filesystem files. The test runs for a given duration in a given mode and generates separate log file to track the test progress. All errors are directed to a separate error log file. Every thread of execution is considered as a user's test thread. Each user runs five types of tests and hence the total number of tests spawned is five times the number of users specified.

To run this workload you have to atleast set these variables in repl_auto_env.xml

```
<!-- FSMULTITHREAD WORKLOAD CONFIGURATION VARIABLES -->
        <var name="NUM_USERS">1</var>
        <var name="DURATION">172800</var>
        <var name="ROOT_FOLDER">fsystem3_cfix</var>
        <var name="FS_SIZE">322122540000</var>

```
* NUM_USERS - total number of users for each node ( MAX - 5 )
* DURATION - time to run the workload ( in sec )
* ROOT_FOLDER - directory inside mountpt. where all operation will happen
* FS_SIZE - size of the filesystem ( in bytes )

### Files Required :-

* repl_auto.xml ( MAIN STORCH SCRIPT )
* repl_auto_env.xml ( ENVFILE OF MAIN SCRIPT )
* workload/
    * FSMultiThreadTest.c ( workload main file )
    * fsstress.h ( support file )
    * sample_config ( config file )
* script/
	* builconfig_workload.sh ( for FSMultiThread )
	* prereq.py ( to check for condition to run the test )
	* startworkload.sh ( for starting FSMultiThread )
    * stopworkload.sh ( for stopping FSMultiThread )
	* initreplpri.sh ( initalize replication on primary )
	* initreplstd.sh ( initalize replication on standby )
	* repltermpri.sh ( termainate replicaiton on primary )
	* repltermstd.sh ( termainate replication on standby )
	
	
	
### HOW TO RUN THE TEST :-

* First download REPLICATION_AUTO folder to any node ( This folder will contain all the scripts and workload that is required for the run )
* Modify the repl_auto_env.xml script

```
<envVariables>
        <var name="ADE_PRI">repl_pri5</var>
        <var name="ADE_STD">repl_std5</var>
        <var name="OS_USER">jjitesh</var>
        <var name="PRIMARY_MAIN_NODE">slcaa794</var>
        <var name="PRIMARY_NODE">slcaa794,slcaa796,slcaa797</var>
        <var name="STANDBY_MAIN_NODE">slcaa795</var>
        <var name="STANDBY_NODE">slcaa795</var>
        <var name="PRIMARY_MOUNTPT">/primary</var>
        <var name="STANDBY_MOUNTPT">/standby</var>
        <var name="STAGGING_NODE">slcas542</var>
        <var name="STAGGING_LOCATION">/scratch/jjitesh/REPLICATION_AUTO</var>
		
		<!-- REPLICATION INIT PRIMARY -->
        <var name="REPLICATION_MODE">C</var>
        <var name="REPLICATION_INTERVAL">30s</var>
        <var name="DEBUG_LOG_LEVEL">6</var>

```

	* ADE_PRI - name of ade view on primary	
	* ADE_STD - name of ade view on standby
	* OS_USER - name of os user
	* PRIMARY_MAIN_NODE
	* PRIMARY_NODE - all nodes in primary cluster
	* STANDBY_MAIN_NODE
	* STANDBY_NODE - all nodes in standby cluster
	* PRIMARY_MOUNTPT
	* STANDBY_MOUNTPT
	* STAGGING_NODE - downloaded REPLICATION_AUTO node
	* STAGGING_LOCATION - downloaded REPLICATION_AUTO path
		
	* REPLICATION_MODE - ( C or i )
	* REPLICATION_INTERVAL - only in case on interval mode
	* DEBUG_LOG_LEVEL - range (1,6)
	
	
* NOW RUN THE storch script wither using sths or " ./storch execute repl_auto.xml -envfile repl_auto_env.xml


### LOG FILES LOCATION

* FSMultiThread - SNAPSHOT_AUTO/workload/fsstress.log
                - SNAPSHOT_AUTO/workload/fsstress_error.log
                - SNAPSHOT_AUTO/workload/filelist.log
* crs,asm,apx,acfs and oks logs can be found at location depending on env.
	
	
	
	
	
	
	
	
	

