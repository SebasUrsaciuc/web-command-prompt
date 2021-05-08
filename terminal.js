(async () => {
    history.scrollRestoration = "manual";

    println(`Web Command Prompt [Version ${version}]`);
    println("Under MIT License (Free to use).");
    line();

    if(firefox) {
        println("You are using FireFox. Some functionality like copy-paste will not work!");
        line();
    }

    cmd.focus();

    while (true) {
        //RESET
        variables.CD = currentDir;

        setScrollToCaret();

        let i = (await input(`${currentDir}> `)).trim();

        let args = i.split(" ");
        let cm = args.shift();

        if(i.length > 0)
            chrono = [...chrono, i];

        await execute(cm, args, true);
    }
})();