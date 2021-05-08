let cmds = { };
let shorts = { };
let variables = { }; //TO SAVE
let cmdMemory = { }; //TO SAVE

let execute = async function (name, args, ln) {
    name = name.toLowerCase();

    args = args.join(" ");

    let v;

    for(let k in variables) {
        args = args.replace("$" + k, variables[k]);
    }

    args = args.split(" ");

    if(shorts[name] !== undefined) {
        args = shorts[name][1];
        name = shorts[name][0];
    }

    if(name === "")
        return;
    else if(cmds[name] === undefined)
        println(`"${name}" is not an command!`);
    else {
        if(args.length === 1 && args[0] === "")
            args = [];

        try {
            v = args[0] === "/?"? await execute("help", [name]) : await cmds[name].exec(name, args);
        } catch (err) {
            println(`An error happened during the execution of "${name}".`);
            println(`Error message: "${err.message}"`)
        }
    }

    if(ln === true)
        line();

    return v;
}

let sortCmds = function () {
    const old = cmds;

    cmds = Object.keys(cmds).sort().reduce((o, k) => {
        o[k] = old[k];
        return o;
    }, { });
}

// Not Enough Args
function NEA(c) {
    println(`Not enough arguments! Type "help ${c}" or "${c} /?" for more help.`)
}

//UnKnows Syntax
function UKS(c) {
    println(`Incorrect Syntax! Type "help ${c}" or "${c} /?" for more help.`)
}

function getMemory(cmd) {
    if(cmdMemory[cmd] === undefined)
        cmdMemory[cmd] = { };
    
    return cmdMemory[cmd];
}



cmds.help = {
    desc: "Shows help screen or display help for a command",
    args: ["", "[command]"],
    help: `No arguments will display command list, otherwise will display
help for the indicated command`,
	exec: (cmd, args) => {
        if(args[0] === undefined) {
            println(`This is the command list. For see more info about a command, type "HELP [command]" or "[command] /?"`);

            sortCmds();

            let maxl = 0;

            for(let cmd in cmds) {
                if(maxl < cmd.length)
                    maxl = cmd.length;
            }

            maxl += 3;

            for(let cmd in cmds) {
                if(cmds[cmd].hide === true)
                    continue;

                printf(cmd.padEnd(maxl, ' ').toUpperCase());
                println(cmds[cmd].desc);
            }
        } else {
            let name = args[0];

            println(cmds[name].desc);
            line();
            if(cmds[name].args.length > 0) {
                cmds[name].args.forEach((v) => {
                    println(name.toUpperCase() + " " + v);
                });
            }
            if(cmds[name].help.length > 0) {
                line();
                println(cmds[name].help);
            }
        }
    }
}

cmds.reload = {
    desc: "Reloads the console",
    args: [""],
    help: ``,
    exec: (cmd, args) => {
        location.reload();
    }
}

cmds.log = {
    desc: "Downloads the console content",
    args: ["", "[filename]"],
    help: ``,
    exec: (cmd, args) => {
        args = args.join(" ");
        download(before.text() + after.text(), args === ""? "log.txt" : args);
    }
}

cmds.chrono = {
    desc: "Downloads the console commands history",
    args: ["", "[filename]"],
    help: ``,
    exec: (cmd, args) => {
        args = args.join(" ");

        let d = new Date();

        let chr = `Web Command Prompt History\nDate: ${d.getHours()}:${d.getMinutes()} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}\n` + chrono.join("\n");

        download(chr, args === ""? "chrono.txt" : args);
    }
}

cmds.echo = {
    desc: "Prints on screen the arguments",
    args: ["[message]"],
    help: ``,
	exec: (cmd, args) => {
        println(args.join(" "));
    }
}

cmds.color = {
    desc: "Set console color",
    args: ["[background] [foreground]"],
    help: `No arguments will reset the color.
    
Colors can be 4 formats:
- short hexadecimal: #FFF
- long hexadecimal: #FF00FF
- rgb: rgb(123, 43, 234)
- css color name: orange`,
	exec: (cmd, args) => {
        if(args[0] === undefined)
            resetColor();
        else
            setColor(args[0], args[1]);
    }
}

cmds.theme = {
    desc: "Save and load color combinations",
    args: ["", "/L [name]", "/D [name]", "/S [name] [background] [foreground]"],
    help: `No arguments will display a theme list.
    
/L = Load a theme
/D = Delete a theme
/S = Set a theme`,
	exec: (cmd, args) => {
        let mem = getMemory(cmd);

        if(args.length === 0) {
            println("There is a list of the actual themes");

            let nameT = "Name";
            let bgT = "Background";
            let fgT = "Foreground";

            let maxNameL = nameT.length;
            let maxBgL = bgT.length;
            let maxFgL = fgT.length;

            for(let k in mem) {
                let v = mem[k];

                maxNameL = Math.max(maxNameL, k.length);
                maxBgL = Math.max(maxBgL, v[0].length);
                maxFgL = Math.max(maxFgL, v[1].length);
            }

            maxNameL += 3;
            maxBgL += 3;

            let ttl = nameT.padEnd(maxNameL, ' ') + bgT.padEnd(maxBgL, ' ') + fgT.padEnd(maxFgL, ' ');

            println(ttl);
            println("".padEnd(ttl.length, '─'));

            for(let k in mem) {
                let v = mem[k];

                println(k.padEnd(maxNameL, ' ') + v[0].padEnd(maxBgL, ' ') + v[1].padEnd(maxFgL, ' '))
            }
        } else if(args[0].toUpperCase() === "/L") {
            if(args.length < 2) {
                NEA(cmd);
                return;
            }

            let th = mem[args[1]];

            if(th === undefined) {
                println(`The theme "${args[1]}" does not exist!`);
                return;
            }

            setColor(th[0], th[1]);
        } else if(args[0].toUpperCase() === "/D") {
            if(args.length < 2) {
                NEA(cmd);
                return;
            }

            if(!(delete mem[args[1]])) {
                println(`The theme "${args[1]}" does not exist!`);
            }
        } else if(args[0].toUpperCase() === "/S") {
            if(args.length < 4) {
                NEA(cmd);
                return;
            }

            mem[args[1]] = [args[2], args[3]];
        } else
            UKS(cmd);
    }
}

cmds.clear = {
    desc: "Clears the console",
    args: [""],
    help: ``,
	exec: (cmd, args) => {
        before.text("");
        after.text("");
    }
}

cmds.cursor = {
    desc: "Get and set cursor properties",
    args: ["/S", "/S [width] [height]", "/B", "/B [timeMS]"],
    help: `/S = Set or get cursor size
    Maximum width and height is 8!
/B = Set or get cursor blink speed
    Time is express in milliseconds!`,
    exec: (cmd, args) => {
        if(args.length < 1) {
            NEA(cmd);
            return;
        }

        if(args[0].toUpperCase() === "/S") {
            if(args.length === 1)
                println(getCursorSize().w + " x " + getCursorSize().h);
            else if(args.length === 3)
                setCursorSize(args[1], args[2]);
            else
                NEA(cmd);
        } else if(args[0].toUpperCase() === "/B") {
            if(args.length === 1)
                println(getBlinkSpeed());
            else
                setBlinkSpeed(args[1]);
        } else {
            UKS(cmd);
        }
    }
}

cmds.touch = {
    desc: "Makes a file",
    args: ["[path]"],
    help: ``,
	exec: (cmd, args) => {
        args = args.join(" ");

        if(args === "") {
            NEA(cmd);
            return;
        }

        if(createFile(args) === null) {
            println(`The file "${getFullPath(args)}" already exists!`)
        }
    }
}

cmds.del = {
    desc: "Removes a file",
    args: ["[filename]"],
    help: ``,
    exec: (cmd, args) => {
        args = args.join(" ");

        if(args === "") {
            NEA(cmd);
            return;
        }

        if(!removeFile(args))
            println(`The file "${getFullPath(args)}" does not exist!`)
    }
}

cmds.cd = {
    desc: "Sets or display current directory",
    args: ["", "..", "[path]"],
    help: `With no argument`,
	exec: (cmd, args) => {
        args = args.join(" ");
        let cd = getDir(currentDir);

        if(args === "") {
            println(currentDir);
        } else if(args === "..")
            setCurrentDir(cd.parent ?? currentDir);
        else if(getDir(args) === undefined)
            println(`"${args}" not exist!`);
        else
            setCurrentDir(args);

        return currentDir;
    }
}

cmds.mkdir = {
    desc: "Makes a directory",
    args: ["[path]"],
    help: ``,
	exec: (cmd, args) => {
        args = args.join(" ");

        if(args === "") {
            NEA(cmd);
            return;
        }

        if(createDir(args) === null) {
            println(`The directory "${getFullPath(args)}" already exists!`)
        }
    }
}

cmds.rmdir = {
    desc: "Removes a directory",
    args: ["[dir-name]"],
    help: `The command will remove also sub-directories of the directory!
It does not work with paths, only directory names of the current directory
are accepted.`,
	exec: (cmd, args) => {
        args = args.join(" ");

        if(args === "") {
            NEA(cmd);
            return;
        }

        if(!removeDir(getCurrentDirPlus(args)))
            println(`"${getCurrentDirPlus(args)}" does not exist!`)
    }
}

cmds.dir = {
    desc: "Shows directories and files in the actual or specified directory",
    args: ["", "[path]"],
    help: ``,
	exec: (cmd, args) => {
        args = args.join(" ");

        let dir;

        if(args !== undefined) {
            dir = getDir(args);

            if(dir === undefined) {
                println(`"${getFullPath(args)}" does not exist!`)
                return;
            }
        } else
            dir = getDir(currentDir);

        println("Directories and files in " + dir.path);

        let files = { };
        let dirs = { };

        for(let k in dir.content) {
            let v = dir.content[k];

            if(v.type === "file")
                files[k] = v;
            else if(v.type === "dir")
                dirs[k] = v;
        }

        let old = files;
        files = Object.keys(files).sort().reduce((o, k) => {
            o[k] = old[k];
            return o;
        }, { });

        old = dirs;
        dirs = Object.keys(dirs).sort().reduce((o, k) => {
            o[k] = old[k];
            return o;
        }, { });

        if(files.length > 0)
            line();

        for(let k in dirs)
            println(k);

        for(let k in files) {
            let v = files[k];

            println("".padStart(dirOnStart.length, ' ') + k);
        }

        return args;
    }
}

cmds.tree = {
    desc: "Show directory tree",
    args: ["", "[path]"],
    help: `* Can be very slow and can block the command prompt if the file
system structure is huge, and slow down the command prompt if
used multiple times. ${cmds.refresh? `If this already happened, you can use
the "refresh" command, refresh the page without clearing the console.` : ''}`,
	exec: (cmd, args) => {
        args = args.join(" ");
        args = getFullPath(args);
        let il = getSplitPath(args).length;

        let dir = getDir(args);

        if(dir === undefined) {
            println(`The directory "${args}" does not exist!`)
            return;
        }

        let i = [0];
        let ends = [false];

        println(args);

        let splPathLen = 0, old = { }, pre = "", mid = "", dc = { };

        while(true) {
            splPathLen = getSplitPath(dir.path).length;
            dc = dir.content;

            if(i[splPathLen - il] < Object.keys(dc).length) {
                old = dc;

                dir = Object.values(Object.keys(dc).sort().reduce((o, k) => {
                    o[k] = old[k];
                    return o;
                }, { }))[i[splPathLen - il]];

                ends.push(false);

                pre = "";
                splPathLen = getSplitPath(dir.path).length;

                if (i[splPathLen - 1 - il] + 1 === Object.keys(old).length) {
                    mid = "└";
                    ends[splPathLen - 1 - il] = true;
                } else
                    mid = "├";

                for(let j = 0; j < splPathLen - 1 - il; j++)
                    pre = pre.concat(ends[j]? "    " : "│   ");

                println(pre + mid + "───" + dir.name);

                i.push(0);
            } else {
                i.pop();
                ends.pop();
                i[i.length - 1]++;
                dir = getDir(dir.parent);
            }

            if(i[0] === undefined)
                break;
        }
    }
}

cmds.var = {
    hide: true,
    desc: "Shows variable list, set or delete a variable",
    args: ["", "/D [name]", "/S [name] [value]", "/S /C [name] [command]"],
    help: `/C = the variable will take command return as value`,
	exec: async (cmd, args) => {
        if(args.length <= 0) {
            let nameT = "Name";
            let valueT = "Value";

            let len1 = nameT.length, len2 = valueT.length;

            for(let k in variables) {
                len1 = Math.max(k.length, len1);
                len2 = Math.max(variables[k].length, len2);
            }

            len1 += 3;

            println("Name".padEnd(len1) + "Value")
            println("".padEnd(len1 + len2, '─'));
            for(let k in variables) {
                println(k.padEnd(len1, ' ') + variables[k]);
            }
        } else {
            if(args[0] === "/S") {
                let add = (args[1] ?? "").toUpperCase() === "/C"? 1 : 0;

                if (args.length < 3 + add) {
                    NEA(cmd);
                    return;
                }

                let name = args[1 + add];

                if (add) {
                    let cmd = args[3];
                    let argv = args.slice(4);

                    variables[name] = await execute(cmd, argv) ?? "";
                } else {
                    variables[name] = args.slice(2).join(" ");
                }
            } else if(args[0] === "/D") {
                if(args.length < 2) {
                    NEA(cmd);
                    return;
                }

                if(!(delete variables[args[1]]))
                    println(`The variable ${args[1]} does not exist!`);
            } else {
                UKS(cmd);
            }
        }
    }
}

cmds.math = {
    desc: "Execute math operations with variables or numbers",
    args: ["{sum|sub|mul|div} [val_1] [val_2]", "{min|max} [val_1] [val_2]", "{eq|neq|g|ge|l|le} [val_1] [val_2]", "sqrt [val]"],
    help: `eq = equal
neq = not equal
g = greater
ge = greater or equal
l = less
le = less or equal`,
    exec: (cmd, args) => {
        let r;

        if(args.length < 2) {
            NEA(cmd);
            return;
        }

        if(args[0] === "sqrt") {
            r = Math.sqrt(parseFloat(args[1])).toString();
        }

        if(args.length < 3) {
            NEA(cmd);
            return;
        }

        if(args[0] === "sum") {
            r = (parseFloat(args[1]) + parseFloat(args[2])).toString();
        } else if(args[0] === "sub") {
            r = (parseFloat(args[1]) - parseFloat(args[2])).toString();
        } else if(args[0] === "mul") {
            r = (parseFloat(args[1]) * parseFloat(args[2])).toString();
        } else if(args[0] === "div") {
            r = (parseFloat(args[1]) / parseFloat(args[2])).toString();
        } else if(args[0] === "min") {
            r = Math.min(parseFloat(args[1]), parseFloat(args[2])).toString();
        } else if(args[0] === "max") {
            r = Math.max(parseFloat(args[1]), parseFloat(args[2])).toString();
        }

        if(r === undefined) {
            UKS(cmd);
            return;
        }

        println(r);
        return r;
    }
}

cmds.title = {
    desc: "Sets webpage title",
    args: ["", "[title]"],
    help: `No arguments will reset th title`,
	exec: (cmd, args) => {
        setTitle(args.join(" "));

        return getTitle();
    }
}

shorts["cd.."] = ["cd", [".."]];