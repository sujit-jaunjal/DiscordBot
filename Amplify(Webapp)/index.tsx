import React, { useEffect, useState } from 'react'
import { Box, Button, Flex, Heading, Image, Text, Link } from '@chakra-ui/react'
import QRCode from "react-qr-code";
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected'
import axios from 'axios'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncateAddress } from '@/utils/utils';
import { status } from '@/utils/constants';
import {useRouter} from 'next/router'
import { utils } from 'ethers';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL


function Home() {

    const { address } = useAccount()
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    })
    const { disconnect } = useDisconnect()

    const [qrCodeValue, setQrCodeValue] = useState<string>('')
    const [claimStatus, setClaimStatus] = useState<string>('')
    const [userId, setUserId] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false)
    const [votes, setVotes] = useState(0)
    const [balance, setBalance] = useState('')
    const [discord_uname, setUname] = useState(null)
    const [url, setURL] = useState<string | null>('')

    const router = useRouter()
    console.log('router', router.query)

    const handleCallback = async () => {
        const payload = {
            claims: [{
                id: 2,
                provider: 'discourse',
                redactedParameters: '****@gmail.com',
                ownerPublicKey: '0x6536tgdejwvd',
                timestampS: '9763p971',
                witnessAddresses: ['wintnessaddress1'],
                signatures: ['signature1'],
                parameters: {
                    userId: '123456',
                }
            }]
        }
        const response = await fetch('http://localhost:3001/callback/0x4d7F2f4BAE824Ff50fbc44e2a573D462619fC518',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
        console.log('response', response)
    }

    const fetchUserClaimDetails = (address: string) => {
        axios.get(`${BASE_URL}/user/${address}`).then((res) => {
            console.log('res', res)
            setClaimStatus(res.data.claimStatus.S)
            setQrCodeValue(res.data.templateLink.S)
            if(res.data.claimStatus.S === status.CLAIMED && res.data.userId) {
                setUserId(res.data.userId.S)
            }
        })
    }

   // const [searchParams, setSearchParams] = useSearchParams();
   
    useEffect(() => {
        let details = navigator.userAgent;
        let regexp = /android|iphone|kindle|ipad/i;
        

        let isMobileDevice = regexp.test(details);

        if (isMobileDevice) {
            setIsMobileDevice(true)
        } else {
            setIsMobileDevice(false)
        }

      
      //  console.log("The address of user wallet"+address)
         // setURL(searchParams.get("code"))

       // console.log(url);
    //    const {code} = router.query
    //     console.log(code);
        
    }, [])

    useEffect(() => {

        if (router.query && router.query.callbackId) {
            fetchUserClaimDetails(router.query.callbackId as string)
        }
        if(router.query && router.query.code){
            getVerified()
        }
    }, [router.query])

    useEffect(() => {
        if (address) {
            getVote()      
            let apeAddr=address
            if(apeAddr){
                getApecoinBalance(apeAddr)
                }  

                console.log("Reaching here for DB");
                

                if(!(balance=='')){
                    console.log("Inserted data");
                    insertDB()  
                }

            axios.post(`${BASE_URL}/adduser`, { userAddress: address }).then((res) => {
                setQrCodeValue(res.data.templateUrl)
            }).catch((e) => {
                if (e.response && e.response.data && e.response.data.error && e.response.data.error.includes('ConditionalCheckFailedException')) {
                    setError('User already exists')
                  } else {
                    console.error(e)
                }
            })
        }
    }, [address])

    useEffect(() => {
        if (error) {
            // alert(error)
            setError('')
            fetchUserClaimDetails(address as string)
        }
    }, [error, address])

    const { ethers } = require('ethers');

    // Define the contract ABI
    const abi = [
    {
        "constant": true,
        "inputs": [
        {
            "name": "_owner",
            "type": "address"
        }
        ],
        "name": "balanceOf",
        "outputs": [
        {
            "name": "balance",
            "type": "uint256"
        }
        ],
        "payable": false,
        "type": "function"
    }
    ];
      

// Define the Apecoin token contract address
const tokenAddress = '0x4d224452801ACEd8B2F0aebE155379bb5D594381';


// Define a function to get the Apecoin balance for a given address
async function getApecoinBalance(apeAddr: any) {
  // Create a provider object to connect to the Ethereum network
  //console.log(apeAddr);
  
  const provider = ethers.getDefaultProvider('mainnet');
  
  // Create a contract object for the Apecoin token
  const contract = new ethers.Contract(tokenAddress, abi, provider);

  // Call the balanceOf method on the contract to get the balance for the given address
  const balCount = await contract.balanceOf(apeAddr);

  //console.log("Apecoin balance - "+balCount);

  const apeBal = utils.formatEther(balCount)

  //const apeVal = parseInt()
  
  // Return the balance as a string
  setBalance(apeBal)

}


 // Replace with the address you want to check
// getApecoinBalance(addr)
//   .then(balance => console.log(`Apecoin balance for ${addr}: ${balance}`))
//   .catch(error => console.error(error));



async function getVerified(){
    let pay
    let discordUname
    var defCode = router.query.code ? router.query.code: ""
    var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("client_id", "<client-id>");
    urlencoded.append("client_secret", "<client-secret-id>");
    urlencoded.append("grant_type", "authorization_code");
    urlencoded.append("code", defCode.toString());
    urlencoded.append("redirect_uri", "http://localhost:3001/");
    
    var requestOptions = {
      method: 'POST', 
      headers: myHeaders,
      body: urlencoded,
    };
    
    await fetch("https://discord.com/api/oauth2/token", requestOptions)
      .then(response => response.json())
      .then(result => {console.log(result)
        const tempToken = result.access_token   
        pay=tempToken 
    })
      .catch(error => console.log('error', error));


      console.log(pay);

          //GET Discord Username

     myHeaders.append("Authorization", "Bearer "+pay);

    var requestUname = {
      method: 'GET',
      headers: myHeaders,

    };
    
    await fetch("https://discord.com/api/users/@me ", requestUname)
      .then(response => response.json())
      .then(result => {console.log(result)
        const userName = result.username 
        discordUname=userName 
        setUname(discordUname)
    })
      .catch(error => console.log('error', error));

}

 async function getVote(){
    let cnt
    const query = `
        {
        votes(where: { voter: "${address}", space_in: ["apecoin.eth"] }) {
            voter
        }
        }
        `;

        await fetch('https://hub.snapshot.org/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                const count = data.data.votes.length
                setVotes(data.data.votes.length);
              //  console.log(count)
                cnt = count
            })
            .catch(error => console.error(error));
            return cnt
}

// Define the insertDB function
async function insertDB() {
    axios.post(`http://localhost:3001/api/db`, { wallet_address: address, apecoin_cnt: balance, snapshot_cnt: votes, discord_uname: discord_uname }).then((res) => {
        console.log("DB query hit");
        
    }).catch((e) => {
            console.error(e)
    })
}


    return (
        <Box h='100vh' p={8}>
            <Flex h='70vh' direction='column' alignItems='center' justifyItems='center'>
                <Flex alignItems="center" gap={4}>
                    <Image src='assets/img/ape.png' alt='logo' boxSize={20} />
                    <Heading as='h1'>Amplify Community</Heading>
                </Flex>

                <Flex direction='column' alignItems='center' justifyItems='center'>

                    {
                        address || userId ?
                            <>

                                <Text variant="subtext" fontWeight="700" mt={10} mb={4} display={userId ? 'none' : ''}>Connected wallet</Text>

                                <Text variant="subtext" fontWeight="700" mt={10} mb={4} display={userId ? 'none' : ''}><>Apecoin Balance - {balance}</></Text>

                                <Text variant="subtext" fontWeight="700" mt={10} mb={4} display={userId ? 'none' : ''}><>Snapshot Vote Count - {votes} </></Text>


                                {/* Account address */}
                                <Flex alignItems='center' gap={2}>
                                    <Box h="48px" alignItems="center" gap={2} backgroundColor="secondary" p={2} borderRadius="24px" display={userId ? 'none' : 'inline-flex'}>
                                        <Image src='/assets/img/ape.png' boxSize={8} alt="" />
                                        <Text color="#00008b" fontSize={{ base: '12px', md: '14px', lg: '16px' }} fontWeight={700} pr={4} display={userId ? 'none' : ''}>{isMobileDevice ? truncateAddress(address!) : address}</Text>
                                    </Box>
                                    <Text variant="subtext" fontSize={{ base: '12px', md: '14px', lg: '16px' }} fontWeight={700} color="red" onClick={() => disconnect()} cursor="pointer" display={userId ? 'none' : ''}>Disconnect</Text>
                                </Flex>

                                {/* QR Code */}

                                
                                {
                                    (claimStatus === status.CLAIMED && userId) ? renderUserIdClaimed({userId}) : 
                                        (!isMobileDevice) &&
                                        <>
                                            {
                                                qrCodeValue && renderQRCode({ qrCodeValue })
                                            }
                                        </>
                                    
                                }

                                <Button variant="primary"
                                    isDisabled={isMobileDevice ? !qrCodeValue : false}
                                    onClick={() => {
                                        if (isMobileDevice)
                                            window.open(qrCodeValue, '_blank')
                                    }} p={4} mt={isMobileDevice ? 8 : 2} h="56px" w="230px">{(isMobileDevice) ? "Open Reclaim wallet" : "Download Reclaim wallet"}</Button>
                            </>
                            : <Flex direction='column' alignItems='center' gap={8} justifyItems='center'>
                                <Image src='/assets/img/heroimage.png' mt={8} width={isMobileDevice ? '250px' : '350px'} height={isMobileDevice ? '250px' : '341px'} alt="" />
                                <Heading as='h2'>Let&apos;s mint your Apecoin!</Heading>
                                <Text variant="subtext">Your Amplify community access token.</Text>
                                
                                {
                                    (!discord_uname) ? 
                                    <Text  variant="subtext" fontWeight="700" mt={10} mb={4} display={userId ? 'none' : ''}>Connect your Discord Account here - <a href='https://discord.com/api/oauth2/authorize?client_id=1095347553836486796&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2F&response_type=code&scope=identify'>Connect</a></Text> 
                                    : 
                                    <><Text variant="subtext" fontWeight="700" mt={10} mb={4} display={userId ? 'none' : ''}><>Discord Account Connected! - {discord_uname}</></Text><ConnectButton /></>
                                    
                                }
                            </Flex>
                    }
                </Flex>
            </Flex>
        </Box>

    )
}

const renderQRCode = ({qrCodeValue}: {qrCodeValue: string}) => {
    return (
        <><Heading as='h1' mt={10}>Scan the QR</Heading>
            <Text variant="subtext" mt={8} mb={8}>Use your discourse credentials in Reclaim wallet to prove you have required trust-level.</Text>
            <QRCode
                value={qrCodeValue}
            />
            <Text mt={10} color="gray" fontWeight={500}>Don&apos;t have the Reclaim wallet?</Text>
        </>
    )
}

const renderUserIdClaimed = ({userId}: {userId: string}) => {
    return (
        <Text  mt={10} mb={4} color="gray" fontWeight={700}>You&apos;ve already claimed your Apecoin for user id {userId}! 🎉</Text>
    )
}

export default Home
