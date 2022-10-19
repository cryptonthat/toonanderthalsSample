import React, { useState } from "react";
import Web3 from "web3"
import WalletConnectProvider from "@walletconnect/web3-provider"
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import "./index.css";




function App() {

  const [applicationError,setApplicationError] = useState(false)
  const [chainError,setChainError] = useState(false)
  const [walletA, setWalletA] = useState(null) //42 CHAR WALLET ADDRESS
  const [userWeb3, setUserWeb3] = useState()

  const [loaded, setLoaded] = useState(false)

  window.onload = async (event) => {
    await loadImages()
    if (!loaded) {
      await new Promise(r => setTimeout(r, 1000));
      setLoaded(true)
    }  
};

const loadImages = async () => {
    const img = new Image();
    img.src = await "./caveman.png";
}

  const connectWallet = () => {
    return
    // eslint-disable-next-line
    if(typeof window.ethereum == 'undefined') {
      document.getElementById("metamask").className="walletError"
    }
    document.getElementById("walletPopUp").style.transform = "scale(1)"
    document.getElementById("walletPopUp").style.display = "flex"
  }

  const connectWC = async () => {
    
    const provider = new WalletConnectProvider({ //Wallet Connect Provider object set up with apps infura id
      rpc: { 1: "https://eth-mainnet.g.alchemy.com/v2/b_l6CgfljjON-1NoQsZHZzfO79ByfUET"}
    });

    provider.walletConnectProvider = undefined;
      await provider.enable().catch((error) => {
        if (error) {
          console.log("Modal Closed")
          return
        }
      })

    const web3 = new Web3(provider)

      let chainID = await web3.eth.getChainId()
      console.log(chainID)

      if (chainID !== 1){
        setChainError(true)
        await new Promise(r => setTimeout(r, 5000));
        setChainError(false)
        return
      }

      provider.on("chainChanged", chainId => {
        if (chainId !== 1){
          setApplicationError("Application Error: Chain changed, please change back to Ethereum to continue")
        } else {
          setApplicationError(false)
        }
      });

      provider.on("accountsChanged", accounts => {
        setWalletA(accounts[0])
      });

      const accounts = await web3.eth.getAccounts();


      setWalletA(accounts[0])
      setUserWeb3(web3)

      document.getElementById("walletPopUp").style.transform = "scale(0)"

      return

  }

  const connectMM = async () => {
    if (typeof window.ethereum !== 'undefined') {

      const chainID= await window.ethereum.request({ method: 'eth_chainId' });
      console.log("CHAIN ID: "+chainID.slice(2))
      if ((chainID.slice(2)) !== "1"){
        setChainError(true)
        await new Promise(r => setTimeout(r, 5000));
        setChainError(false)
        return
      }

      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})

      const web3 = new Web3(window.ethereum)

      window.ethereum.on('chainChanged', chainId => {
        console.log(chainId)
        if (chainId !== "0x1"){
          setApplicationError("Application Error: Chain changed, please change back to Ethereum to continue")
        } else {
          setApplicationError(false)
        }
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletA(accounts[0])
      });

      setWalletA(accounts[0])
      setUserWeb3(web3)

      document.getElementById("walletPopUp").style.transform = "scale(0)"

      return

    } else {
      return
    }
  }

  const connectCBW = async () => {

    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: `Toonanderthals`,
      appLogoUrl: `https://Toonanderthals.wtf/logo512.png`,
      darkMode: false
    })

    const ethereum = coinbaseWallet.makeWeb3Provider("https://mainnet.infura.io/v3/a95467b39b7a4743ae7772768260a8a2", 1)

    const web3 = new Web3(ethereum)

    await ethereum.enable().then((accounts) => {
  console.log(`User's address is ${accounts[0]}`)
  web3.eth.defaultAccount = accounts[0]
})

      const accounts = await web3.eth.getAccounts();

      setWalletA(accounts[0])
      setUserWeb3(web3)

      document.getElementById("walletPopUp").style.transform = "scale(0)"

      return

  }

  const mint = async () => {

    var tweb3 = userWeb3;

    const toonsABI = require("./toonsABI.json")

    const toonsContract = new tweb3.eth.Contract(toonsABI,"0xC96aB840A194f2417cCC0De6077b4D7eF310DA2A");

    let mintAmount = document.getElementById("mintAmount").value

    await toonsContract.methods.mintToon(mintAmount).send({from: walletA})
    .on('sending', (payload) => {
        //sending to metamask
        document.getElementById("mint-txt").innerHTML = "Accept the transcation in your wallet"
    })
    .on('sent', (payload) => {
        document.getElementById("mint-txt").innerHTML = "Sending transaction to your wallet"
    })
    .on('transactionHash', (hash) => {
        document.getElementById("mint-txt").innerHTML = `<a rel="noreferrer" target="_blank"  href=https://etherscan.io/tx/${hash}>Transaction sent</a>, awaiting confirmation`
    })
    .on('receipt', (receipt) => {
       document.getElementById("mint-txt").innerHTML = `Mint Toonanderthal Successful, view your NFT on <a rel="noreferrer" target="_blank" href=https://opensea.io/assets/ethereum/0xc96ab840a194f2417ccc0de6077b4d7ef310da2a/${receipt.events.Transfer.returnValues.tokenId}>Opensea</a>`
    })
    .on('confirmation', (confirmation,receipt,latestBlockHash) => {
      if (confirmation===1) {
       document.getElementById("mint-txt").innerHTML = `Mint Toonanderthal Successful, view your NFT on <a rel="noreferrer" target="_blank" href=https://opensea.io/assets/ethereum/0xc96ab840a194f2417ccc0de6077b4d7ef310da2a/${receipt.events.Transfer.returnValues.tokenId}>Opensea</a>`
      }
    })
    .on('error', (error, receipt) => {
      document.getElementById("mint-txt").innerHTML = "Error occurred during mint transaction"
    });

  }

  return (
    <>
    { loaded ?
    <>
      { applicationError ?
    <div className="appErrorWrapper">
      <div className="appErrorPopUp">
        <p className="sm-txt col-white pd04 txt-align-c">{applicationError}</p>
      </div>
    </div>
    :
    <>
    </>
  }
    <div id="walletPopUp">
    <p className="md-txt sdark-txt">Choose your preferred wallet</p>
    { chainError ? <p className="sm-txt red-txt sdark-txt">Wrong Network - Please change to Ethereum</p> : <></>}
    <div className="flex-center flex-gg-20 flex-se">
      <div onClick={connectMM} id="metamask" className="flex-center flex-col wallet">
        <img src="metamask.png" alt="metamask" className="walletIcon"></img>
        <p className="sm-txt txt-align-c">Metamask</p>
      </div>
       <div onClick={connectWC} className="flex-center flex-col wallet">
         <img src="walletconnect.png" alt="walletconnect" className="walletIcon"></img>
        <p className="sm-txt txt-align-c">Wallet Connect</p>
      </div>
      <div onClick={connectCBW} className="flex-center flex-col wallet">
         <img src="coinbasewallet.svg" alt="coinbasewallet" className="walletIcon"></img>
        <p className="sm-txt txt-align-c">Coinbase Wallet</p>
      </div>
    </div>
  </div>

  <div className="flex-center flex-col main">

    <div className="nav-bar">

    <div></div>      

      <div className="social-icons">
        <a rel="noreferrer" target="_blank" href="https://twitter.com/toonanderthals"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.543 7.85486C21.5576 8.06644 21.5576 8.27801 21.5576 8.49154C21.5576 14.9978 16.6045 22.5015 7.54759 22.5015V22.4976C4.87215 22.5015 2.25229 21.7352 0 20.2902C0.389031 20.337 0.780012 20.3604 1.17197 20.3614C3.38915 20.3633 5.54296 19.6194 7.28726 18.2495C5.18026 18.2095 3.3326 16.8357 2.68714 14.8301C3.42523 14.9725 4.18574 14.9432 4.91018 14.7453C2.61304 14.2812 0.96039 12.2629 0.96039 9.91896C0.96039 9.89751 0.96039 9.87704 0.96039 9.85656C1.64485 10.2378 2.41121 10.4494 3.19512 10.4728C1.03157 9.02682 0.364656 6.14858 1.67118 3.89824C4.17111 6.97442 7.8596 8.8445 11.8191 9.04243C11.4223 7.33225 11.9644 5.54017 13.2436 4.33798C15.2268 2.47375 18.3459 2.5693 20.2101 4.55151C21.3129 4.33408 22.3698 3.92945 23.337 3.35614C22.9694 4.49593 22.2001 5.46412 21.1725 6.07935C22.1484 5.9643 23.102 5.703 24 5.30422C23.3389 6.29483 22.5063 7.15772 21.543 7.85486Z" fill="#EBEBEB"></path></svg></a>
        <a rel="noreferrer" target="_blank" href="https://opensea.io/collection/toonanderthalsnft"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.42821 13.3339L1.51218 13.2019L6.57619 5.27991C6.6502 5.16389 6.82419 5.17592 6.88021 5.30189C7.72618 7.19792 8.45621 9.55592 8.11421 11.0239C7.96821 11.6279 7.5682 12.4459 7.11818 13.2019C7.06021 13.3119 6.99619 13.4199 6.92818 13.5239C6.89621 13.5719 6.84218 13.5999 6.78417 13.5999H1.5762C1.43617 13.5999 1.35419 13.4479 1.42821 13.3339Z" fill="#EBEBEB"></path><path d="M24 14.806V16.06C24 16.132 23.956 16.196 23.892 16.224C23.5 16.392 22.158 17.008 21.6 17.784C20.176 19.766 19.088 22.6 16.656 22.6H6.50998C2.914 22.6 0 19.676 0 16.068V15.952C0 15.856 0.077996 15.778 0.173987 15.778H5.82999C5.94199 15.778 6.02401 15.882 6.01402 15.992C5.974 16.36 6.042 16.736 6.21599 17.078C6.55198 17.76 7.24802 18.186 7.99999 18.186H10.8V16H8.032C7.88998 16 7.80601 15.836 7.88799 15.72C7.91801 15.674 7.95201 15.626 7.988 15.572C8.24998 15.2 8.624 14.622 8.99598 13.964C9.24999 13.52 9.49601 13.046 9.694 12.57C9.73402 12.484 9.76599 12.396 9.798 12.31C9.85198 12.158 9.908 12.016 9.94798 11.874C9.98799 11.754 10.02 11.628 10.052 11.51C10.146 11.106 10.186 10.678 10.186 10.234C10.186 10.06 10.178 9.87801 10.162 9.70398C10.154 9.51399 10.13 9.324 10.106 9.134C10.09 8.96599 10.06 8.8 10.028 8.62601C9.98799 8.372 9.93201 8.12001 9.86799 7.866L9.84601 7.77001C9.798 7.59602 9.75798 7.42999 9.70201 7.25601C9.54398 6.70999 9.36199 6.178 9.17001 5.68C9.10001 5.482 9.01999 5.29201 8.94 5.10202C8.82199 4.81599 8.70199 4.55601 8.59198 4.30999C8.53601 4.198 8.48799 4.09599 8.44001 3.992C8.38598 3.87399 8.33001 3.75602 8.27399 3.64398C8.23402 3.55798 8.18799 3.478 8.15598 3.39801L7.81402 2.766C7.766 2.68 7.84598 2.578 7.93999 2.60399L10.08 3.18401H10.086C10.09 3.18401 10.092 3.186 10.094 3.186L10.376 3.26399L10.686 3.35198L10.8 3.38399V2.11201C10.8 1.498 11.292 1 11.9 1C12.204 1 12.48 1.12398 12.678 1.326C12.876 1.52802 13 1.80401 13 2.11201V4L13.228 4.06398C13.246 4.06999 13.264 4.078 13.28 4.08998C13.336 4.13198 13.416 4.19402 13.518 4.26998C13.598 4.334 13.684 4.412 13.788 4.49198C13.994 4.65801 14.24 4.87201 14.51 5.11798C14.582 5.18001 14.652 5.24399 14.716 5.30802C15.064 5.63198 15.454 6.01201 15.826 6.43201C15.93 6.54998 16.032 6.66998 16.136 6.79599C16.24 6.92399 16.35 7.05001 16.446 7.17602C16.572 7.344 16.708 7.51798 16.826 7.70002C16.882 7.78601 16.946 7.874 17 7.96C17.152 8.19001 17.286 8.42802 17.414 8.66598C17.468 8.77599 17.524 8.89599 17.572 9.014C17.714 9.332 17.826 9.65601 17.898 9.98002C17.92 10.05 17.936 10.126 17.944 10.194V10.21C17.968 10.306 17.976 10.408 17.984 10.512C18.016 10.844 18 11.176 17.928 11.51C17.898 11.652 17.858 11.786 17.81 11.928C17.762 12.064 17.714 12.206 17.652 12.34C17.532 12.618 17.39 12.896 17.222 13.156C17.168 13.252 17.104 13.354 17.04 13.45C16.97 13.552 16.898 13.648 16.834 13.742C16.746 13.862 16.652 13.988 16.556 14.1C16.47 14.218 16.382 14.336 16.286 14.44C16.152 14.598 16.024 14.748 15.89 14.892C15.81 14.986 15.724 15.082 15.636 15.168C15.55 15.264 15.462 15.35 15.382 15.43C15.248 15.564 15.136 15.668 15.042 15.754L14.822 15.956C14.79 15.984 14.748 16 14.704 16H13V18.186H15.144C15.624 18.186 16.08 18.016 16.448 17.704C16.574 17.594 17.124 17.118 17.774 16.4C17.796 16.376 17.824 16.358 17.856 16.35L23.778 14.638C23.888 14.606 24 14.69 24 14.806Z" fill="#EBEBEB"></path></svg></a>
      </div>
    </div>

    

      <p className="col-grey lg-txt heading">TOONANDERTHALS</p>


       

      <button className="purple-button mgb40 mgt20 mgt60 walletBut" onClick={connectWallet}>{ walletA ? walletA.slice(0,6)+'....'+walletA.slice(37) : "SOLD OUT" }</button>

      { walletA ?

     <>

      <div className="flex-center flex-gg-5 mintSec">
        <input id="mintAmount" type="number" className="sm-input" defaultValue="1" min="1" max="3"></input>
        <button className="purple-button sm-buttom" onClick={mint}>Mint</button>
      </div>

      <p id="mint-txt" className="col-white md-txt txt-align-c mgb20"></p>

     </>
      :

      <>
      </>

    }



    <div className="footer">
    
    <div className="flex-center flex-col">
                    <p className="col-grey txt-align-c fw700 handwritten sm-txt">Toonanderthals are the last evolutionary stage of the human being, but the first evolutionary stage of WEB3 human. Join us and explore the blockchain with a FREE MINT today!</p>

          <a className="handwritten" rel="noreferrer" target="_blank" href="https://toonanderthals.wtf">
            <p className="col-grey sm-txt txt-align-c handwritten">toonanderthals.wtf</p>
          </a>
          </div>
    </div>
    </div>
    <img src="./caveman.png" className="caveman" alt="caveman"></img>
    </>

    :

    <div className="flex-center full flex-col">
      <div className="c-loader"></div>
      <p className="col-white md-txt handwritten">LIGHTING THE FIRE</p>
    </div>
  }
  </>
  );
}

export default App;
