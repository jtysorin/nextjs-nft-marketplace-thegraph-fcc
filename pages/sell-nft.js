import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { Button, Form, useNotification } from "web3uikit";
import basicNftAbi from "../constants/BasicNft.json";
import networkMapping from "../constants/networkMapping.json";
import nftMarketPlaceAbi from "../constants/NFTMarketPlace.json";
import styles from "../styles/Home.module.css";

export default function Home() {
    const dispatch = useNotification();
    const { chainId, account, isWeb3Enabled } = useMoralis();
    // parse chainId from hex (0x234..) to int and then to string
    const chainString = chainId ? parseInt(chainId).toString() : "31337";
    const marketplaceAddress = networkMapping[chainString].NftMarketPlace[0];
    const [proceeds, setProceeds] = useState("0");

    const { runContractFunction } = useWeb3Contract();

    async function approveAndList(data) {
        const nftAddress = data.data[0].inputResult;
        const tokenId = data.data[1].inputResult;
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString();

        const approveOptions = {
            abi: basicNftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        };

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error);
            },
        });
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        const listOptions = {
            abi: nftMarketPlaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        };

        await runContractFunction({
            params: listOptions,
            onSuccess: handleListSuccess,
            onError: (error) => console.log(error),
        });
    }

    const handleListSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT listed",
            position: "bottomR",
        });
    };

    const handleWithdrawSuccess = async (tx) => {
        await tx.wait(1);
        dispatch({
            type: "success",
            message: "Withdrawing proceeds",
            position: "bottomR",
        });
    };

    const withdrawProceeds = async () => {
        await runContractFunction({
            params: {
                abi: nftMarketPlaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "withdrawProceeds",
                params: {},
            },
            onError: (error) => {
                console.log(error);
            },
            onSuccess: handleWithdrawSuccess,
        });
    };

    async function setupUI() {
        const returnedProceeds = await runContractFunction({
            params: {
                abi: nftMarketPlaceAbi,
                contractAddress: marketplaceAddress,
                functionName: "getProceeds",
                params: {
                    seller: account,
                },
            },
            onError: (error) => {
                console.log(error);
            },
        });
        if (returnedProceeds) {
            setProceeds(ethers.utils.formatEther(returnedProceeds).toString());
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            setupUI();
        }
    }, [proceeds, account, isWeb3Enabled, chainId]);

    return (
        <div className={styles.container}>
            <Form
                buttonConfig={{
                    theme: "primary",
                }}
                onSubmit={approveAndList}
                data={[
                    {
                        inputWidth: "50%",
                        name: "NFT Address",
                        type: "text",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell your NFT!"
                id="Main Form"
            />
            <br></br>
            <div>Withdraw {proceeds} ETH</div>
            {proceeds != "1" ? (
                <Button onClick={withdrawProceeds} text="Withdraw" type="button" theme="primary" />
            ) : (
                <div> No Proceeds detected</div>
            )}
        </div>
    );
}
