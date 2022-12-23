const hre = require ("hardhat");


async function main() {
    const currentTimestampInSeconds = Math.round(Date.now()/ 1000);
    const ONE_YEAR_IN_SECONDS = 356 * 24* 60* 60;
    const unlockedTime = currentTimestampInSeconds + ONE_YEAR_IN_SECONDS;
    //const lockedAmount = hre.ethers.utils.parseEther("1");
    
    //console.log(lockedAmount);
    const Store = await hre.ethers.getContractFactory("Store");
    const store = await Store.deploy();
    await store.deployed();
    console.log(`contract adress is : ${store.address}`);
    
}

main().catch((error) => {
    console.log(error);
    process.exitCode= 1;
});