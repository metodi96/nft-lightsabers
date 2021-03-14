import React, { useContext } from 'react'
import AppContext from '../appContext'
import { NavLink } from 'react-router-dom'
import lightsaber from '../assets/images/lightsaber_header.gif'
import wallet from '../assets/images/ether-wallet.png'
import CustomNavLink from './CustomNavLink'
import ReactTooltip from 'react-tooltip';
import 'reactjs-popup/dist/index.css';
import { handleConnect, handleInstall } from '../utils/metamask'
function Navbar() {

    const { account, hasWalletAddress } = useContext(AppContext);

    const renderMetaMaskLabel = () => {
        if (window.ethereum) {
            return !hasWalletAddress && !account ?
                <button onClick={handleConnect}>No wallet address detected</button>
                : `${account.substring(0,8)}...${account.substring(account.length-4, account.length)}`;
        } else {
            return <button onClick={handleInstall}>Install MetaMask</button>;
        }
    };

    return (
        <header className='bg-black text-white'>
            <div className='container mx-auto flex justify-between'>
                
                <nav className='flex'>
                    <NavLink
                        to='/'
                        exact
                        className='inline-flex items-center py-6 px-3 hover:text-grey-200 text-4xl font-bold tracking-widest'>
                        <img src={lightsaber} width={120} alt='ls-header' />
                    </NavLink>
                    <CustomNavLink content='Collection' />
                    <CustomNavLink content='Auctions' />
                    <CustomNavLink content='Guide' />
                </nav>
                <div className='inline-flex py-3 px-3 my-7 mr-8'>
                    <img className='mr-2' src={wallet} width={40} height={40} alt='wallet' />
                    <span className='py-2' data-tip={`Wallet Address: ${account}`}>
                        {renderMetaMaskLabel()}
                    </span>
                    <ReactTooltip />
                </div>
            </div>
        </header>
    )
}

export default Navbar
