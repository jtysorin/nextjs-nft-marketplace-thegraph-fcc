import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import nftMarketPlaceAbi from "../constants/NFTMarketPlace.json";
import basicNftAbi from "../constants/BasicNft.json";
import { Card, useNotification } from "web3uikit";
import { ethers } from "ethers";
import UpdateListingModal from "./UpdateListingModal";

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) {
        return fullStr;
    }

    const separator = "...";
    let separatorLenght = separator.length;
    const charsToShow = strLen - separatorLenght;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);
    return (
        fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
    );
};

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis();
    const [imageURI, setImageURI] = useState("");
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const hideModal = () => setShowModal(false);
    const dispatch = useNotification();

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: basicNftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    });

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketPlaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    });

    async function updateUI() {
        const tokenURI = await getTokenURI();
        if (tokenURI) {
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const tokenURIResponse = await (await fetch(requestURL)).json();
            const imageURI = tokenURIResponse.image;
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            setImageURI(imageURIURL);
            setTokenName(tokenURIResponse.name);
            setTokenDescription(tokenURIResponse.description);
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI();
        }
    }, [isWeb3Enabled]);

    const isOwnedByUser = seller === account || seller === undefined;
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15);

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: handleBuyItemSuccess,
              });
    };

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Item bought!",
            tittle: "Item Bought",
            position: "bottomR",
        });
    };

    return (
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            imageURI={imageURI}
                            onClose={hideModal}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                            setIsSelected={() => {}}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    <img
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
    );
}
