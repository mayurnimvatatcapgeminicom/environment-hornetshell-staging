const expect=require("chai").expect;
const tools=require("../lib/tools");

describe("printName()",function(){
    it("should print the last name first",function(){
        var results=tools.printName({first:"Mayur",last:"Nimavat"});
        expect(results).to.equal("Nimavat,Mayur");
    });
});