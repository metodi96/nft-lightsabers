import React, { useEffect, useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import AppContext from './appContext';
import Home from './pages/Home'
import Collection from './pages/Collection'
import Guide from './pages/Guide'
import Auctions from './pages/Auctions'
import Navbar from './components/Navbar'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
const App = ({ web3 }) => {
  const [account, setAccount] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [hasWalletAddress, setHasWalletAddress] = useState(false);
  const [hasAccountChanged, setHasAccountChanged] = useState(false);
  const [screenBlocked, setScreenBlocked] = useState(false);
  //const location = useLocation();

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const networkId = await web3.eth.net.getId();
        setNetworkId(networkId);
        const [selectedAccount] = await web3.eth.getAccounts();
        setAccount(web3.utils.toChecksumAddress(selectedAccount));
        window.ethereum.on('accountsChanged', (accounts) => {
          setHasAccountChanged(true);
          if (!accounts[0]) {
            setHasWalletAddress(false);
          } else {
            setHasWalletAddress(true);
            setAccount(accounts[0]);
          }
        });
        window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
      }
    };
    init();
  }, [web3.utils, web3.eth]);

  const handleBlockScreen = (blocked) => {
    setScreenBlocked(blocked);
  };

  const handleAccountChanged = (newHasAccountChanged) => {
    setHasAccountChanged(newHasAccountChanged);
  };

  return (
    <AppContext.Provider value={{
      web3,
      handleBlockScreen,
      screenBlocked,
      account,
      hasWalletAddress,
      hasAccountChanged,
      handleAccountChanged,
      networkId
    }}
    >
      <Navbar />
      <Switch>
        <Route path='/' exact component={Home} />
        <Route path='/collection' exact component={Collection} />
        <Route path='/Auctions' exact component={Auctions} />
        <Route path='/Guide' exact component={Guide} />
      </Switch>
      <ToastContainer autoClose={10000} />
    </AppContext.Provider>
  );
}

export default App;
