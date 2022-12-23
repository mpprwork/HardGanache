const {time, loadFixture} = require ("@nomicfoundation/hardhat-network-helpers");
//const {time, loadFixture} = require ("@nomiclabs/hardhat-ganache");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

const {expect} = require ("chai");
const {ethers} = require("hardhat");

describe ("MyTest", function(){
    async function runEveryTime() {
        const ONE_YEAR_IN_SECONDS = 356 * 24* 60* 60;
        const ONE_GWEI = 1_000_000_000;
        //console.log(ONE_YEAR_IN_SECONDS, ONE_GWEI);
        some_gas_price = 1_000_000_000

        //console.log(owner);
        //console.log(otherAccount);

        const Store = await hre.ethers.getContractFactory("Store");
        const [owner, otherAccount] = await ethers.getSigners();
        const store = await Store.deploy();

        await store.deployed();      
        return {Store, store, owner, otherAccount}
    }
    describe("Deployment", function(){
        it("Should check deploy", async function() {
            const{store} = await loadFixture(runEveryTime);
        });

        it("Should set the right owner", async function(){
            const {store, owner} = await loadFixture(runEveryTime);
            expect(await store.owner()).to.equal(owner.address);
    
            //console.log(owner);
            //console.log(store.owner);
        });
    });

    describe("Validations", function(){
        describe("Add Product", function(){
            it("Should countain no elements initially", async function() {
                const{store, otherAccount} = await loadFixture(runEveryTime);

                expect((await store.getAllProducts()).toString()).to.be.empty;
            });

            it("Should not be able to add 0 quantity", async function() {
                const{store} = await loadFixture(runEveryTime);
                //console.log(await Store.addProduct("apples", 0));
                await expect(store.addProduct("apples", 0)).to.be.revertedWith("Quantity can't be 0!")
            });

            it("Should not be able to add NO name", async function() {
                const{store} = await loadFixture(runEveryTime);
                //console.log(await Store.addProduct("apples", 0));
                await expect(store.addProduct("",16)).to.be.revertedWith("You have to enter a name!")
            });

            it("Should add one element", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 14);
                expect((await store.getAllProducts()).toString()).to.equal("apples,14")
            });

            it("Should update one element", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 42);
                expect((await store.getAllProducts()).toString()).to.equal("apples,42")
            });

        });

        describe("Get Product by name", function(){
            it("Should not be able to add NO name", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect(store.getProductByName("")).to.be.revertedWith("You have to enter a name!")
            });

            it("Should revert non-existing products ", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect(store.getProductByName("Pokemons")).to.be.revertedWith("This product does not exist!")
            });

            it("Should return product by name ", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 12);
                await expect((await store.getProductByName("apples")).toString()).
                to.contain("apples,12");
            });
        });

        describe("Update Product Quantity", function(){
            it("Should revert non-existing products ", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect(store.updateProductQuantity(1,16)).to.be.revertedWith("This product does not exist!")
            });

            it("Should update product quantity", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 12);
                await store.updateProductQuantity(0,33);
                await expect((await store.getProductByName("apples")).toString()).
                    to.contain("apples,33");
            });

        });

        describe("Buy Product", function(){
            it("Should not be able to buy non existing product ", async function() {
                const{store} = await loadFixture(runEveryTime); 
                await expect(store.buyProduct(1)).to.be.reverted;
            });

            it("Should not be able to buy 0 quantity products", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 1);
                await store.updateProductQuantity(0,0);
                //Needs another message - "product has 0 quantity please try again later"
                await expect(store.buyProduct(0)).to.be.revertedWith("Quantity can't be 0!");
            });

            it("Should be able to buy 1 product", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 20);
                await store.buyProduct(0);            
                await expect((await store.getProductByName("apples")).toString()).
                to.contain("apples,19");
            });

            it("Should NOT be able to buy 2 of the same product", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 20);
                await store.buyProduct(0);
                await expect(store.buyProduct(0)).to.be.revertedWith("You cannot buy the same product more than once!");
            });
        });

        describe("Set Refund policy number", function(){
            it("Should change the refund policy number to 1", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.setRefundPolicyNumber(1)
                await expect((await store.getRefundPolicyNumber()).toString()).to.equal("1");
            });

            it("Should throw error when policy number is changed AND has passed", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.setRefundPolicyNumber(1)
                await store.addProduct("apples", 20);
                await store.buyProduct(0);
                await expect((await store.getProductByName("apples")).toString()).to.contain("apples,19");
                //console.log(await store.refundProduct(0));
                await expect(store.refundProduct(0)).to.be.revertedWith("Sorry, your request for refund has been denied.");
            });

            it("Should throw error when policy number is changed AND has NOT passed", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.setRefundPolicyNumber(2)
                await store.addProduct("apples", 20);
                await store.buyProduct(0);
                await expect((await store.getProductByName("apples")).toString()).to.contain("apples,19");
                await store.refundProduct(0)
                await expect((await store.getProductByName("apples")).toString()).to.contain("apples,20");
            });
        });

        describe("Refund Product", function(){
            it("Should not be able to refund non-existing product", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect(store.refundProduct(1)).to.be.revertedWith("This product does not exist!");
            });

            it("Should not be able to refund product you did not buy", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 20);
                await expect(store.refundProduct(0)).to.be.revertedWith("You've already returned your product or didn't even bought it.");
            });

            it("Should not be able to refund product after more than 100 blocks you did not buy", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 20);
                await store.buyProduct(0);
                await expect((await store.getProductByName("apples")).toString()).to.contain("apples,19");
                await hre.network.provider.send("hardhat_mine", ["0x63"]);
                await expect(store.refundProduct(0)).to.be.revertedWith("Sorry, your request for refund has been denied.");
            });

            it("Should be able to refund one product", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 20);
                await store.buyProduct(0);
                await expect((await store.getProductByName("apples")).toString()).to.contain("apples,19");
                await store.refundProduct(0)
                await expect((await store.getProductByName("apples")).toString()).to.contain("apples,20");
            });

            it("Should not be able to refund one product twice", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 20);
                await store.buyProduct(0);
                await store.refundProduct(0)
                await expect(store.refundProduct(0)).to.be.revertedWith("You've already returned your product or didn't even bought it.");
            });
        });

        describe("Get Product by ID", function(){
            it("Should not be able to add NO ID", async function() {
            /*
                const{store} = await loadFixture(runEveryTime);
                //Could not figure out a way to simulate empty number with undefined, nan or null
                //TODO: find a way to do empty uint
                await expect(store.getProductById(uint.empty)).to.be.revertedWith("You have to enter a name!")
            */
            });

            it("Should revert non-existing products ", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect(store.getProductById(1)).to.be.revertedWith("This product does not exist!")
            });

            it("Should return product by id ", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 12);
                await expect((await store.getProductById(0)).toString()).
                    to.contain("apples,12");
            });
        });

        describe("Get all Products", function(){
            it("Should return empty products", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect((await store.getAllProducts()).toString()).
                    to.contain("");
            });

            it("Should return ONE product", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 12);
                await expect((await store.getAllProducts()).toString()).
                    to.contain("apples,12");
            });

            it("Should return MORE than one product", async function() {
                const{store} = await loadFixture(runEveryTime);
                await store.addProduct("apples", 12);
                await store.addProduct("oranges", 45);
                await expect((await store.getAllProducts()).toString()).
                    to.contain("apples,12,oranges,45");
            });
        });

        describe("Get refund policy number", function(){
            it("Should return default( 100 ) policy number", async function() {
                const{store} = await loadFixture(runEveryTime);
                await expect((await store.getRefundPolicyNumber()).toString()).
                to.contain("100");
            });
        });
    });

    runEveryTime();
});