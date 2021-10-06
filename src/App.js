import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json'
import './App.css';

// const greeterAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3" // local hardhat node
const greeterAddress = "0xD2950376b6321e7461aA423cce0CC787B3ba41be" // remote ropsten testnet

function App() {
  const [greeting, setGreetingValue] = useState('')
  const greetingForm = useRef(null)

  async function requestAccount() {
    await window.ethereum.request({method: 'eth_requestAccounts'})
  }

  async function fetchGreeting() {
    if(typeof window.ethereum !== 'undefined'){
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
      try {
        const data = await contract.greet()
        setGreetingValue(data)
        console.log('data: ', data)

       } catch (err) {
          console.log("Error: ", err)
        }
    }
  }

  async function setGreeting() {
    const form = greetingForm.current
    let data = form['greeting'].value

    if(!data) return
    if(typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
      const transaction = await contract.setGreeting(data)
      setGreetingValue(data)
      await transaction.wait()
      fetchGreeting()
    }
  }

  useEffect(() => {
    fetchGreeting()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Blockchain Greeting Tutorial
        </p>
        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <div style={{fontSize: "18px", padding: "12px 0"}}>
          <span style={{fontSize: "14px"}}>Greeting:</span> {greeting}
        </div>
        <form ref={greetingForm}>
          <input
            name="greeting"
            // onChange={e => setGreetingValue(e.target.value)}
            placeholder="set greeting"
            type="text"
          />
        </form>
        <button onClick={setGreeting}>Set Greeting</button>

      </header>
    </div>
  );
}

export default App;
