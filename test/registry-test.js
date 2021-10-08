const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Registry contract", function () {
  let Registry, registry, record, record2, admin, user1, user2;

  beforeEach(async () => {
    Registry = await ethers.getContractFactory("Registry");
    [owner, admin, user1, user2, _] = await ethers.getSigners();
    
    registry = await Registry.deploy(admin.address);
    await registry.deployed();

    record = {
      firstName: 'John',
      lastName: 'Doe',
    }

    record2 = {
      firstName: 'Eleanor',
      lastName: 'Bell',
    }
  })

  it("Should set the init address as the admin", async function () {
    expect(await registry.admin()).to.equal(admin.address);
  });

  it("Should create record with first and last names", async function () {
    const regFee = ethers.utils.parseUnits('1000', 'ether')

    const newRecord = await registry.createRecord(record.firstName, record.lastName, {value: regFee });
    await newRecord.wait();

    const fetchRecord = await registry.fetchRecord(1);
    // await fetchRecord.wait();

    expect(await fetchRecord.firstName).to.equal(record.firstName);
    expect(await fetchRecord.lastName).to.equal(record.lastName);
  });

  it("Should fail if address attempts to create more than one record", async function () {
    const regFee = ethers.utils.parseUnits('1000', 'ether')

    // const newRecord = await registry.createRecord(record.firstName, record.lastName, {sender: user1.address, value: regFee });
    const newRecord = await registry.createRecord(record.firstName, record.lastName, { value: regFee });
    await newRecord.wait();

    // const newRecord2 = await registry.createRecord(record2.firstName, record2.lastName, { value: regFee });
  
  });

  it("Should fail if non-admin or not owner attempts to delete", async function () {
    // write test
  });

  it("Should delete record", async function () {
    const regFee = ethers.utils.parseUnits('1000', 'ether')

    const newRecord = await registry.createRecord(record.firstName, record.lastName, { value: regFee });
    await newRecord.wait();

    const deleteRecord = await registry.deleteRecord(1);
    await deleteRecord.wait()

    const data = await registry.fetchRecord(1)

    expect(await data.firstName ).to.equal('')
    expect(await data.lastName ).to.equal('')
  });
  
});
