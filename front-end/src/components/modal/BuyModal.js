import React, { useState, useEffect, useRef } from 'react';
import { useEthers, useTokenBalance } from "@usedapp/core";
import Modal from 'react-bootstrap/Modal';
import { Toast, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const base_api_url = `${window.location.protocol}//${window.location.hostname}:3000/api`;

const BuyModal = ({ isOpen, setIsOpen, tokenAddress}) => {
    const unmounted = useRef(true);
    const { account } = useEthers();
    const [showToastBuy, setShowToastBuy] = useState(false);
    const [toastTextBuy, setToastTextBuy] = useState('');

    useEffect( () => {
        return () => { unmounted.current = false }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    }

    function handleDelete() {
        var apiUrl = base_api_url + '/deleteData'
        var params = {
            walletAddress: account,
            tokenAddress: tokenAddress
        };

        axios.post(apiUrl, params).then(function (response) {
            console.log('msg', response.msg);
            
        }).catch(function (error) {
            console.error(error);
            return false;
        });
        setIsOpen(false);

    }

    return (
      <>
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
        <Modal show={isOpen} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Approve</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
              
          <div className="outer bg-black absolute top-0 left-0 h-full w-full z-20 opacity-80"></div>

            <div className="absolute top-0 left-0 h-full w-full z-30 flex items-center justify-center" onClick={() => handleClose()} >
                <div className="inner max-w-screen-sm flex-grow  text-white  bg-gradient-to-br from-yellow-200 to-yellow-700 p-1 opacity-100 rounded-3xl" onClick={ (e) => { e.stopPropagation(); }} >
                    {account && (
                        <>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center">
                                <div className="text-white m-auto"> Are you going to delete this data really?</div>
                            </div>
                            <div data-bs-dismiss="modal" id="wallet-connect-metamask" className="c-list border-b px-3 py-2 d-flex align-items-center cursor-pointer">
                                <button className="btn btn-wallet wallet-connected m-auto" onClick={ handleDelete }> Yes</button>
                                <button className="btn btn-wallet wallet-connected m-auto" onClick={ handleClose }> No </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }
  
  export default BuyModal;