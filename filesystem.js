const dirOnStart = "[DIR] ";

let fs = { }
let currentDir = "/";

function setCurrentDir(v) {
    currentDir = getFullPath(v, true);
}

function getValidPath(v) {
    if(v === undefined)
        v = "";

    v = v.replaceAll("|", "vertical_line");
    v = v.replaceAll("..", "double_dots");

    while(v.indexOf("//") !== -1) {
        v = v.replaceAll("//", "/empty_name/");
    }

    if(v.endsWith("/") && v.length > 1)
        v = v.substr(0, v.length - 1);

    return v;
}

function getFullPath(v) {
    v = getValidPath(v);

    if(!v.startsWith("/"))
        v = getCurrentDirPlus(v);

    return v;
}

function getCurrentDirPlus(d) {
    d = currentDir + (currentDir.endsWith("/")? "" : "/") + d;

    return getValidPath(d);
}

function getSplitPath(v) {
    v = getFullPath(v).substring(1, v.length).split("/");

    return v[0] === ""? [] : v;
}

function getJoinPath(v) {
    return "/" + v.join("/");
}

function getDir(path) {
    path = getFullPath(path);

    if(path === "/")
        return {path: "/", content:fs};

    let spl = getSplitPath(path);

    let content = fs;
    let dir;

    loop1:
    for(let i = 0; i < spl.length; i++) {
        for(let k in content) {
            let v = content[k];

            if(v.name === spl[i] && v.type === "dir") {
                content = v.content;
                dir = v;
                continue loop1;
            }
        }

        return undefined;
    }

    return dir;
}

function getFile(path) {
    path = getFullPath(path);

    if(path === "/")
        return undefined;

    let spl = getSplitPath(path);

    let content = fs;

    loop1:
    for(let i = 0; i < spl.length - 1; i++) {
        for(let k in content) {
            let v = content[k];

            if(v.name === spl[i] && v.type === "dir") {
                content = v.content;
                continue loop1;
            }
        }

        return undefined;
    }

    return content[spl[spl.length - 1]];
}

function getSubDirs(path) {
    path = getFullPath(path);
    let d = getDir(path);
    let r = { };

    if(d === undefined)
        return undefined;

    for(let k in d.content) {
        let v = d.content[k];

        if(v.type === "dir")
            r[k] = v;
    }

    return r;
}

function createDir(path) {
    path = getFullPath(path);
    let spl = getSplitPath(path);
    let objKey = dirOnStart + spl[spl.length -1];

    if(spl.length === 0)
        return null;

    let dir = fs;

    for(let i = 0; i < spl.length - 1; i++) {
        let aPath = getJoinPath(spl.slice(0, i + 1));

        dir = (getDir(aPath) ?? createDir(aPath)).content;
    }

    if(dir[objKey]?.type === "dir")
        return null;

    let r = {
        type: "dir",
        name: spl[spl.length -1],
        path,
        parent: getJoinPath(spl.slice(0, spl.length - 1)),
        content: { }
    };

    dir[objKey] = r;

    return r;
}

function createFile(path) {
    path = getFullPath(path);
    let spl = getSplitPath(path);
    let ok = spl[spl.length -1];

    if(spl.length === 0)
        return null;

    let dir = fs;

    for(let i = 0; i < spl.length - 1; i++) {
        let aPath = getJoinPath(spl.slice(0, i + 1));

        dir = (getDir(aPath) ?? createDir(aPath)).content;
    }

    if(dir[ok]?.type === "file")
        return null;

    let r = {
        type: "file",
        name: spl[spl.length -1],
        path,
        parent: getJoinPath(spl.slice(0, spl.length - 1)),
        content: ""
    };

    dir[ok] = r;

    return r;
}

function removeDir(path) {
    path = getFullPath(path);
    let spl = getSplitPath(path);

    if(getDir(path) === undefined)
        return undefined;

    let evl = "delete fs";

    for(let i = 0; i < spl.length; i++) {
        evl += `["${dirOnStart + spl[i]}"]${i === spl.length - 1? "" : ".content"}`;
    }

    return eval(evl);
}

function removeFile(path) {
    path = getFullPath(path);
    let spl = getSplitPath(path);

    if(getFile(path) === undefined)
        return undefined;

    let evl = "delete fs";

    for(let i = 0; i < spl.length - 1; i++) {
        evl += `["${dirOnStart + spl[i]}"].content`;
    }

    evl += `["${spl[spl.length - 1]}"]`;

    return eval(evl);
}



function download(c, name) {
    const dwn = document.createElement("a");

    dwn.setAttribute("download", name);
    dwn.setAttribute("href", `data:text/plain;charset=UTF-8,${encodeURIComponent(c)}`);
    dwn.click();
}

function upload() {
    return new Promise(resolve => {
        const upl = document.createElement("a");
        upl.setAttribute("type", "download");

        upl.addEventListener('change', onC);

        upl.click();

        function onC(e) {
            upl.removeEventListener('change', onC);

            resolve(upl.files[0]);
        }
    });
}

function getUploadFileContent(f) {
    return new Promise(resolve => {
        let reader = new FileReader();

        reader.addEventListener("load", onL);

        reader.readAsDataURL(f);

        function onL(e) {
            reader.removeEventListener("load", onL);

            resolve(e.target.result);
        }
    });
}