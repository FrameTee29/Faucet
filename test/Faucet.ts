import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers/lib/utils";
import { Faucet, Token } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Faucet", function () {
  let owner1: SignerWithAddress;
  let owner2: SignerWithAddress;

  let donator: SignerWithAddress;

  let tom: SignerWithAddress;
  let jerry: SignerWithAddress;
  let john: SignerWithAddress;

  let Faucet: Faucet;
  let BUSD: Token;
  let USDT: Token;
  let USDC: Token;

  let mintAmount = parseEther("1000000");
  let mintTokenOfDonator = parseEther("1000000000");

  const getBalance = async (tokenAddress: Token) => {
    const balanceOfToken = await Faucet.getBalanceOfFaucet(
      tokenAddress.address
    );
    await expect(balanceOfToken).to.equal(mintAmount);
  };

  before(async () => {
    const signer = await ethers.getSigners();

    owner1 = signer[0];
    owner2 = signer[1];
    tom = signer[2];
    jerry = signer[3];
    john = signer[4];
    donator = signer[5];

    const FaucetContract = await ethers.getContractFactory("Faucet");

    Faucet = await FaucetContract.connect(owner1).deploy();

    const Token = await ethers.getContractFactory("Token");

    BUSD = await Token.deploy("Binance token", "BUSD");
    USDT = await Token.deploy("Tether", "USDT");
    USDC = await Token.deploy("USD Coin", "USDC");

    await BUSD.mint(Faucet.address, mintAmount);
    await USDT.mint(Faucet.address, mintAmount);
    await USDC.mint(Faucet.address, mintAmount);

    await BUSD.mint(donator.address, mintTokenOfDonator);
    await USDT.mint(donator.address, mintTokenOfDonator);
    await USDC.mint(donator.address, mintTokenOfDonator);
  });

  describe("Get balance of Token in Faucet contract", async () => {
    it("Get balance of BUSD", async () => {
      await getBalance(BUSD);
    });

    it("Get balance of USDT", async () => {
      await getBalance(USDT);
    });

    it("Get balance of USDC", async () => {
      await getBalance(USDC);
    });
  });

  describe(`Check owner`, async () => {
    it("Get Owner", async () => {
      const ownerOfFaucet = await Faucet.owner();
      await expect(ownerOfFaucet.toLowerCase()).to.equal(
        owner1.address.toLowerCase()
      );
    });

    it("Change owner1 to owner2", async () => {
      await Faucet.connect(owner1).setOwner(owner2.address);
    });

    it("Current owner is owner2", async () => {
      const ownerOfFaucet = await Faucet.owner();
      await expect(ownerOfFaucet.toLowerCase()).to.equal(
        owner2.address.toLowerCase()
      );
    });

    it("Change owner2 to owner1", async () => {
      await Faucet.connect(owner2).setOwner(owner1.address);
    });

    it("Current owner is owner1", async () => {
      const ownerOfFaucet = await Faucet.owner();
      await expect(ownerOfFaucet.toLowerCase()).to.equal(
        owner1.address.toLowerCase()
      );
    });
  });

  describe(`Donate to Faucet`, async () => {
    it("ERC20: Approve Faucet contract [BUSD , USDC]", async () => {
      await BUSD.connect(donator).approve(
        Faucet.address,
        ethers.constants.MaxUint256
      );
      await USDT.connect(donator).approve(
        Faucet.address,
        ethers.constants.MaxUint256
      );
      await USDC.connect(donator).approve(
        Faucet.address,
        ethers.constants.MaxUint256
      );
    });

    it("Donate BUSD and Get Balance BUSD in Faucet Contract", async () => {
      const donate = await Faucet.connect(donator).donateTofaucet(
        BUSD.address,
        parseEther("100")
      );

      await expect(donate)
        .to.emit(Faucet, "DonateToken")
        .withArgs(donator.address, Faucet.address, parseEther("100"));

      const balanceOfToken = await Faucet.getBalanceOfFaucet(BUSD.address);

      await expect(balanceOfToken).to.equal(parseEther("1000100"));
    });

    it("Donate USDT and Get Balance USDT in Faucet Contract", async () => {
      const donate = await Faucet.connect(donator).donateTofaucet(
        USDT.address,
        parseEther("100")
      );

      await expect(donate)
        .to.emit(Faucet, "DonateToken")
        .withArgs(donator.address, Faucet.address, parseEther("100"));

      const balanceOfToken = await Faucet.getBalanceOfFaucet(USDT.address);

      await expect(balanceOfToken).to.equal(parseEther("1000100"));
    });

    it("Donate USDC and Get Balance USDC in Faucet Contract", async () => {
      const donate = await Faucet.connect(donator).donateTofaucet(
        USDC.address,
        parseEther("100")
      );

      await expect(donate)
        .to.emit(Faucet, "DonateToken")
        .withArgs(donator.address, Faucet.address, parseEther("100"));

      const balanceOfToken = await Faucet.getBalanceOfFaucet(USDC.address);

      await expect(balanceOfToken).to.equal(parseEther("1000100"));
    });
  });

  describe(`Request Token`, async () => {
    it(`Tom wanna request BUSD`, async () => {
      const tomRequestBUSD = await Faucet.connect(tom).requestToken(
        BUSD.address
      );

      await expect(tomRequestBUSD)
        .to.emit(Faucet, "RequestToken")
        .withArgs(tom.address, parseEther("1000"), BUSD.address);

      const balanceOfBUSD = await BUSD.balanceOf(tom.address);

      await expect(balanceOfBUSD).to.equal(parseEther("1000"));
    });

    it(`Tom wanna request BUSD again !!! (Must be reverted)`, async () => {
      const tx = Faucet.connect(tom).requestToken(BUSD.address);

      await expect(tx).to.be.revertedWith(
        "lock time has not expired. Please try again later"
      );
    });
  });
});
