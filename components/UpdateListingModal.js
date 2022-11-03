import { Modal, Input, Card, useNotification } from "web3uikit";
import { useState } from "react";
import { useWeb3Contract } from "react-moralis";
import nftMarketPlaceAbi from "../constants/NFTMarketPlace.json";
import { ethers } from "ethers";
import Image from "next/image";

export default function UpdateListingModal({
    nftAddress,
    tokenId,
    isVisible,
    marketplaceAddress,
    imageURI,
    onClose,
}) {
    const dispatch = useNotification();
    const [priceToUpdateListingWith, setPriceToUpdateListingWith] = useState(0);

    const handleUpdateListingSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Listing updated",
            title: "Listing updated - please refresh (and move blocks)",
            position: "bottomR",
        });
    };

    const { runContractFunction: updateListing } = useWeb3Contract({
        abi: nftMarketPlaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(priceToUpdateListingWith || "0"),
        },
    });

    return (
        <Modal
            isVisible={isVisible}
            type="number"
            title="NFT Details"
            cancelText="Cancel"
            okText="Update Price"
            onOk={() => {
                updateListing({
                    onError: (error) => {
                        console.log(error);
                    },
                    onSuccess: handleUpdateListingSuccess,
                });
            }}
            onCancel={onClose}
            onCloseButtonPressed={onClose}
        >
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "20px 0 20px 0",
                }}
            >
                <Image loader={() => imageURI} src={imageURI} height="200" width="200"></Image>
                <br></br>
                <Input
                    label="Update listing price in L1 Currency (ETH)"
                    name="New listing price"
                    type="number"
                    onChange={(event) => {
                        setPriceToUpdateListingWith(event.target.value);
                    }}
                />
            </div>
        </Modal>
    );
}
