'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Home() {

  const [balance, setBalance] = useState(null);
  const [adressData, setAdressdata] = useState<any[]>(null);
  const [nfts, setNfts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState([]);
  const [delegation, setDelegation] = useState(null);

  const headers = {
    project_id: 'mainnetRUrPjKhpsagz4aKOCbvfTPHsF0SmwhLc',
  };

  const address = 'addr1x88ttk0fk6ssan4g2uf2xtx3anppy3djftmkg959tufsc6qkqt76lg22kjjmnns37fmyue765qz347sxfnyks27ysqaqd3ph23';
  
  const fetchData = async () => {
    try {
      // Získanie informácií o adrese
      const addressResponse = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`, { headers });
      const addressData = await addressResponse.json();

      setAdressdata(addressData)
      
      // Výpočet zostatku v ADA
      const lovelace = addressData.amount.find((amt) => amt.unit === 'lovelace')?.quantity || 0;
      setBalance(lovelace / 1_000_000);

      // Filtrovanie NFT aktív
      const nftUnits = addressData.amount.filter((amt) => amt.unit !== 'lovelace');
      const nftDetails = await Promise.all(
        nftUnits.map(async (nft) => {
          const assetResponse = await fetch(`https://cardano-mainnet.blockfrost.io/api/v0/assets/${nft.unit}`, { headers });
          return assetResponse.json();
        })
      );

      setNfts(nftDetails)

    } catch (error) {
      console.error('Fetch error:', error); 
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-fit m-6 md:m-10 ">
        <div className="flex items-center w-full gap-4">
          <p className="text-2xl font-bold">Zůstatek:</p>
          <p className="text-xl">{balance} ₳</p>
        </div>
        <Table className="w-full hidden md:block">
          <TableHeader className="">
            <TableRow className="">
              <TableHead className="text-left w-full max-w-fit">Název</TableHead>
              <TableHead className="text-left w-full ">Počet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
          {/* <TableRow className={`h-[80px] flex items-center`} >
            <TableCell className="text-left w-full flex items-center gap-3">
            Název
            </TableCell> 
            <TableCell className="text-left w-full">Počet</TableCell>
          </TableRow> */}
          {nfts.map((data, index)=>{
              
              const imageUrl = typeof data.onchain_metadata.image === 'string' ? data.onchain_metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/") : null;
              const evenOrOdd = index % 2 ? "bg-gray-300" : "";

              return(
              <TableRow className={`max-h-[80px] h-full ${evenOrOdd}`}  key={index}>
                <TableCell className="text-left h-[80px] flex items-center gap-3">
                  {imageUrl ? (
                    <Image className="w-[50px] h-auto max-w-fit" src={imageUrl} alt={data.onchain_metadata.name} width={50} height={50} />
                  ) : (
                    "-"
                  )}
                  <p className="">{data.onchain_metadata.name}</p>
                </TableCell> 
                <TableCell className="text-left w-full h-[80px]">{data.quantity}</TableCell>
              </TableRow>)
            })}
          </TableBody>
        </Table>
        <div className="w-full max-w-fit block md:hidden">
          {nfts.map((data, index)=>{
            const imageUrl = typeof data.onchain_metadata.image === 'string' ? data.onchain_metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/") : null;
            const evenOrOdd = index % 2 ? "bg-gray-300" : "";

            return(
            <div className={`flex flex-col p-[24px] ${evenOrOdd}`} key={index}>
              <div className="flex items-center gap-4">
                <p className="font-bold">Název:</p>
                <div className="flex items-center gap-3">
                  <p>{data.onchain_metadata.name}</p>
                  {imageUrl ? (
                    <Image className="w-[50px] h-auto max-w-fit" src={imageUrl} alt={data.onchain_metadata.name} width={50} height={50} />
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-bold">Počet:</p>
                <p>{data.quantity}</p>
              </div>
            </div>)
          })}
        </div>
    </div>
  );
}
