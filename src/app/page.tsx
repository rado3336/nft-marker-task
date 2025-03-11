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
    <div className="w-full max-w-fit m-10 ">
        <div className="flex items-center w-full gap-4">
          <p className="text-2xl font-bold">Zůstatek:</p>
          <p className="text-xl">{balance} ₳</p>
        </div>
        <Table className="w-full max-w-fit">
          <TableHeader className="">
            <TableRow>
              <TableHead className="w-full">Název</TableHead>
              <TableHead className="w-full">název aktiva</TableHead>
              <TableHead className="w-full">Počet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
          {nfts.map((data, index)=>{
                  const imageUrl = typeof data.onchain_metadata.image === 'string'
                  ? data.onchain_metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : null;
  
                console.log(data.onchain_metadata.name, "data.onchain_metadata.name");
                console.log(data.onchain_metadata.image, "data.onchain_metadata.image");
              // const imageUrl = `https://ipfs.io/ipfs/QmV3HtjKZUGeAZnEeytLC3WJaz5txoWzKXhmT7mf2Cinuw`;
              return(
              <TableRow key={index}>
                <TableCell className="text-left w-full">{data.onchain_metadata.name}</TableCell> 
                <TableCell className="text-left w-full">{data.onchain_metadata.name}<p className="max-w-[4OOpx]"></p></TableCell>
                <TableCell className="text-left w-full">{data.quantity}</TableCell>
                <TableCell className="text-left">
                  {imageUrl ? (
                    <Image className="w-[50px] h-auto max-w-fit" src={imageUrl} alt={data.onchain_metadata.name} width={50} height={50} />
                  ) : (
                    "-"
                  )}
                </TableCell>
          
              </TableRow>)
            })}
          </TableBody>
        </Table>
    </div>
  );
}
