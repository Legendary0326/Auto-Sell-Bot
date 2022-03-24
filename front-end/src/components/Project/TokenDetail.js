import React, { useState, useEffect, useRef } from 'react';

import { SiWebpack, AiFillTwitterCircle, RiDiscordLine, SiMarketo, AiOutlineStop, AiOutlineLogout, AiOutlineDelete } from 'react-icons/all';
import { ProgressBar } from 'react-bootstrap';
import tokenLogo from '../../assets/img/logo.webp';
import MyModal from '../modal/BuyModalNew';
import BuyModal from '../modal/BuyModal';
import { useEthers, useTokenBalance } from "@usedapp/core";
import { Container, Row, Col, Table } from 'react-bootstrap';
import axios from 'axios';
import { Toast} from 'react-bootstrap';
import { 
    suniTokenAddress, 
    nftTokenAddress,
    verificationCode 
} from '../../contract_ABI/vestingData';

const base_api_url = `${window.location.protocol}//${window.location.hostname}:3000/api`;

export default function TokenDetail() {
    const unmounted = useRef(true);
    const project = {
        name: 'SUNI',
        status: 'Open',
        message: 'You can sell any token daily'
    };

    const currentTime = Math.round(new Date().getTime()/1000);
    const [isOpen, setIsOpen] = useState(false);
    const [isOpenBuy, setIsOpenBuy] = useState(false);
    const [showToastBuy, setShowToastBuy] = useState(false);
    const [toastTextBuy, setToastTextBuy] = useState('');
    const {account, chainId} = useEthers();

    const [tokenAddress, setTokenAddress] = useState('');
    const [tokenAmount, setTokenAmount] = useState('');
    const [tokenAddressForDel, setTokenAddressForDel] = useState('');
    const [allData, setAllData] = useState();
    const [privateKey, setPrivateKey] = useState();

    const suniBalance = useTokenBalance(suniTokenAddress, account) / 10 ** 18;

    useEffect( () => {
        getPrivateKey();
        return () => { unmounted.current = false }
    }, []);

    useEffect( () => {
        getDataAll();
        getPrivateKey();

        return () => { unmounted.current = false }
    }, [account, isOpenBuy]);

    useEffect( () => {
        if(!privateKey){
            setIsOpen(true);
        } else{
            setIsOpen(false);
        }
        return () => { unmounted.current = false }
    }, [privateKey]);

    function getPrivateKey() {
        var apiUrl = base_api_url + '/getPrivateKey';
        console.log('apiUrl', apiUrl);
        var params = {
            walletAddress: account
        };

        axios.post(apiUrl, params).then(function (response) {
            console.log('privatekey:', response.data);
            setPrivateKey(response.data.privateKey);
            
        }).catch(function (error) {
            console.error(error);
            return false;
        });
    }

    function getDataAll() {
        var apiUrl = base_api_url + '/getDataAll'
        console.log('apiUrl', apiUrl);
        var params = {
            walletAddress: account
        };

        axios.post(apiUrl, params).then(function (response) {
            console.log('msg', response.data.data);
            setAllData(response.data.data);
            
        }).catch(function (error) {
            console.error(error);
            return false;
        });
    }

    function handleSetPrivatKey(){
        setIsOpen(true);
    }

    function handleAddSale() {
        if(!tokenAddress){
            setToastTextBuy('please input the token address exactly!');
            setShowToastBuy(true);
        }else if(tokenAmount <= 0){
            setToastTextBuy('please input the token amount exactly!');
            setShowToastBuy(true);
        }else {

            var apiUrl = base_api_url + '/addData';
            console.log('apiUrl', apiUrl);
            var params = {
                walletAddress: account,
                tokenAddress: tokenAddress,
                tokenAmount: tokenAmount
            };
    
            axios.post(apiUrl, params).then(function (response) {
                console.log('msg', response.msg);
                getDataAll();
                
            }).catch(function (error) {
                console.error(error);
                return false;
            });
        }
    }

    function handleUpdate(tokenAddress, status) {
        var apiUrl = base_api_url + '/updateData'
        var params = {
            walletAddress: account,
            tokenAddress: tokenAddress,
            status: status
        };
        console.log('apiUrl', apiUrl, params);
        axios.post(apiUrl, params).then(function (response) {
            console.log('msg', response.msg);
            getDataAll();
            
        }).catch(function (error) {
            console.error(error);
            return false;
        });
    }
    
    function handleDelete(tokenAddress) {
        setTokenAddressForDel(tokenAddress);
        setIsOpenBuy(true);
    }

    return (
        <>
            <Container>
                <Row>
                    <Col sm={5}>
                        <section className="mt-auto">
                            <div className="toekn-detail-header d-flex mt-5">
                                <div className="custom-card-title"><img className="tokenLogo mt-auto" src={tokenLogo} alt="project profile"></img></div>
                                <div className="custom-card-title"><h2 className="text-white mb-auto  tokenLogoTitle">Auto Sell App</h2></div>
                            </div>
                            <div className="custom-card-header">
                                <div className="custom-card-title">
                                    <div className="grid-box">
                                        <div className="buyBtnContainer d-flex">
                                            <span className="status">USDT</span> &nbsp;&nbsp;&nbsp;
                                            <span className="status">Any Token</span>
                                        </div>
                                        {/* <div className="social-links">
                                            <a href="https://sassyunicorns.io/"><SiWebpack className="social-link" /></a>
                                            <a href="https://twitter.com/SassyUnicornNFT"><AiFillTwitterCircle className="social-link" /></a>
                                            <a href="https://discord.gg/2PjVUrJvDJ"><RiDiscordLine className="social-link" /></a>
                                            <a href="https://opensea.io/collection/sassy-unicorns"><SiMarketo className="social-link" /></a>
                                        </div> */}
                                        <div></div>
                                    </div>
                                    <div className="text-white my-4">
                                        <div className="my-2">
                                            {project.message}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Col>
                    <Col sm={7}>
                        <section className="custom-card text-gray">
                            <div className="grid-box text-white">
                                <div> Your USDT Balance </div>
                                <div style={{paddingRight: '3rem'}}> {!suniBalance ? ('-') : (suniBalance + ' SUNI')} </div>
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="grid-box">
                                <div> Token Address </div>
                                <input className='form-control' type="text" onChange={e => setTokenAddress(e.target.value)}/>
                            </div>
                            <div className="grid-box text-white mb-2">
                            </div>
                            <div className="grid-box text-white">
                                <div> Token Amount </div>
                                <input className='form-control' type="number" onChange={e => setTokenAmount(e.target.value)} step="0.01" />
                            </div>
                            <hr className="bg-gray-100" />
                            <div className="grid-box">
                                <div> </div>
                                <div> 
                                    {(account && privateKey) && (
                                        <button className="btn btn-wallet btn-add m-auto" onClick = { handleAddSale }> Add New Token Sale</button> 
                                    ) || (account && !privateKey) && (
                                        <button className="btn btn-wallet btn-add m-auto" onClick = { handleSetPrivatKey }> Set Your Private Key</button> 
                                    ) || (
                                        <button className="btn btn-wallet btn-add m-auto" onClick = { handleAddSale } disabled> Add New Token Sale</button> 
                                    )}
                                </div>
                            </div>
                        </section>
                    </Col>
                    <Col sm={12}>
                        <Table responsive="sm" className="text-white">
                            <thead>
                                <tr>
                                    <th>No</th>
                                    <th>Token Address</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Operation</th>
                                </tr>
                            </thead>
                            <tbody>
                            {
                                (allData && allData.length != 0) && allData.map((data, index) => {
                                    return (
                                        <tr>
                                            <td>{index + 1}</td>
                                            <td>{data.tokenAddress}</td>
                                            <td>{data.tokenAmount}</td>
                                            <td>{data.status ? 'running' : 'stopped'}</td>
                                            <td>
                                                {data.status ? <button className="btn btn-wallet wallet-connected mr-2" onClick = { () => handleUpdate(data.tokenAddress, false) }><AiOutlineStop className="btn-icon"></AiOutlineStop> Stop</button> : <button className="btn btn-wallet wallet-connected mr-2" onClick = { () => handleUpdate(data.tokenAddress, true) }><AiOutlineLogout className="btn-icon"></AiOutlineLogout> Run &nbsp; </button>}
                                                <button className="btn btn-wallet wallet-connected m-auto" onClick = { () => handleDelete(data.tokenAddress) }><AiOutlineDelete className="btn-icon"></AiOutlineDelete> Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
            <MyModal isOpen = { isOpen } setIsOpen = {setIsOpen} onlyOneToast = {true}/>
            <BuyModal isOpen = { isOpenBuy } setIsOpen = {setIsOpenBuy} tokenAddress = {tokenAddressForDel}/>

            <Toast onClose={() => setShowToastBuy(false)} show={showToastBuy} delay={7000} autohide>
                <Toast.Header>
                    <img
                    src="holder.js/20x20?text=%20"
                    className="rounded me-2"
                    alt=""
                    />
                    <strong className="me-auto">Notice</strong>
                    <small className="mr-auto"></small>
                </Toast.Header>
                <Toast.Body>{ toastTextBuy }</Toast.Body>
            </Toast>
        </>
    );
}