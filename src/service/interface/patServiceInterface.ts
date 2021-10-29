interface PatServiceInterface {
    getPatent: string;
}

function printLabel(labeledObj: PatServiceInterface) {
    console.log(labeledObj.getPatent);
}

let myObj = { size: 10, getPatent: "Size 10 Object" };
printLabel(myObj);