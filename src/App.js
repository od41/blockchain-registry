import { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal'

import './App.css';

import Registry from './artifacts/contracts/Registry.sol/Registry.json'

import {contractAddress} from './.config'
console.log(contractAddress)

function App() {
  const [records, setRecords] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const newRecordForm = useRef(null)

  async function getUserAddress() {
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    
    console.log(signer)
    // setUserAddress(signer)
  }

  async function fetchRecords() {
    // const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/f1b4413e138b4b8a8247c53ca79bdbb5")  // sepolia production
    const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/f1b4413e138b4b8a8247c53ca79bdbb5")  // goerli production
    // const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/")  // local dev
    const registryContract = new ethers.Contract(contractAddress, Registry.abi, provider)
    const data = await registryContract.fetchRecords()

    let items
    try{
      items = await Promise.all(data.map(async datum => {
        // const canDelete = datum.creator === signer.address
        let item = {
          profileId: datum.profileId,
          name: datum.name,
          message: datum.message,
          // canDelete: canDelete 
        }
  
  
        return item
      }))
    } catch (err) {
      let message;
      if(err.code === -32603){
        message = err.data.message
        // message = message.split("\'")
        message = message.match(/'([^']+)'/)[1]
        message += `. Please try again`

      }else {
        message = err.message
        message += `. Please try again`
      }

      setError(message)
    }

    setRecords(items)
    setIsLoading(false)
  }

  async function createRecord() {
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const form = newRecordForm.current
    const name = form['name'].value
    const message = form['message'].value

    const contract = new ethers.Contract(contractAddress, Registry.abi, signer)
    const regFee = ethers.utils.parseUnits('0.0001', 'ether')

    try {
      const transaction = await contract.createRecord(name, message, {
        value: regFee
      })
      await transaction.wait()
     } catch (err) {
        let message;
        if(err.code === -32603){
          message = err.data.message
          // message = message.split("\'")
          message = message.match(/'([^']+)'/)[1]
          message += `. Please try again`

        }else {
          message = err.message
          message += `. Please try again`
        }

        setError(message)
      }
    fetchRecords()
  }

  async function deleteRecord(profileId) {
    setError('')
    const web3modal = new Web3Modal()
    const connection = await web3modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(contractAddress, Registry.abi, signer)
    try {
      const transaction = await contract.deleteRecord(profileId)
      await transaction.wait()
     } catch (err) {
        let message;
        if(err.code === -32603){
          message = err.data.message
          // message = message.split("\'")
          message = message.match(/'([^']+)'/)[1]

        }else {
          message = err.message
        }

        setError(message)
      }

    fetchRecords()
  }

  useEffect(() => {
    getUserAddress()
    fetchRecords()
  }, [])

  // if(isLoading && !records.length) {
  //   return <div>
  //     <h1>No records created</h1>
  //   </div>
  // }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          dMessageBoard
        </h1>
        <p>{userAddress}</p>
        <div className="container">

          <div className="editor">

              <form ref={newRecordForm}>
              <div>
                <input
                  name="name"
                  placeholder="Name"
                  type="text"
                />
              </div>
              <div>
                <input
                  name="message"
                  placeholder="Message"
                  type="text"
                  />
              </div>
            </form>
            <button onClick={createRecord}>Post message</button>
            <p className="regFee">Registration requires 0.0001ETH</p>
            
          </div>

          <div className="records">
            <div className="errors" style={{display: error == '' ? 'none' : 'flex',}}>{error}</div>

            <button onClick={fetchRecords} className="reloadButton">Reload</button>

            {!isLoading && !records.length ? <>
                <h3 className="notice">No records created</h3>
              </> : 
                <ul className="dataList">
                  {records.map((record, i) => {
                    return <li key={record.profileId}>
                      <div className='message'>
                      {record.message}
                      </div> 
                      <div className='sender'>
                      @{record.name} 
                      </div>
                    {/* <button className="deleteButton" onClick={() => deleteRecord(record.profileId)}>delete</button> */}
                    </li>
                  })}
                </ul>
            }
            
          </div>
        
        
        </div>

      </header>
    </div>
  );
}

export default App;
