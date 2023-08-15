import { useEffect, useState } from "react";
import type { NextPage } from "next";
import CopyToClipboard from "react-copy-to-clipboard";
import * as XLSX from "xlsx";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Spinner } from "~~/components/Spinner";
import { displayTxResult } from "~~/components/scaffold-eth";

type BUILDER_DATA = {
  id: string;
};

const BGBuilders: NextPage = () => {
  // const [builderWithStakingChallengeAccepted, setBuilderWithStakingChallengeAccepted] = useState<BUILDER_DATA[]>([]);
  const [addressCopied, setAddressCopied] = useState(false);
  const [allBuilderAddress, setAllBuildersAdderess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const API_URL = "https://buidlguidl-v3.ew.r.appspot.com/builders";

    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = (await res.json()) as BUILDER_DATA[];
      console.log("All Builders", data);
      // setBuilderWithStakingChallengeAccepted(buildersWithStakingChallengeAccepted);
      setAllBuildersAdderess(data.map(builder => builder.id));
      setLoading(false);
    };

    fetchData();
  }, []);
  const handleDownloadExcel = () => {
    const dataToExport = allBuilderAddress.map(address => ({
      BuilderAddress: address,
      votes: 100,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport, { skipHeader: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BG Builders");

    XLSX.writeFile(wb, `bg_builders.xlsx`);
  };

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">ACCEPTED BUIDLERS</span>
          </h1>
          <p className="text-center text-lg">Choose the challenge you want to see!</p>
        </div>

        <div className="flex-grow w-full mt-4 px-8 py-2">
          {/*Render Builders list*/}
          <div className="flex flex-col items-center justify-center gap-4">
            <h2 className="text-center text-2xl m-0">Builders {allBuilderAddress.length}</h2>
            {loading ? (
              <Spinner width="55" height="55" />
            ) : (
              <div className="grid w-3/4 gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex gap-2">
                    <div className="">
                      <button className="btn btn-primary btn-sm" onClick={handleDownloadExcel}>
                        Download Excel
                      </button>
                    </div>
                    <CopyToClipboard
                      text={JSON.stringify(allBuilderAddress)}
                      onCopy={() => {
                        setAddressCopied(true);
                        setTimeout(() => {
                          setAddressCopied(false);
                        }, 800);
                      }}
                    >
                      {addressCopied ? (
                        <CheckCircleIcon
                          className="ml-1.5 text-xl font-normal text-sky-600 h-8 w-8 cursor-pointer"
                          aria-hidden="true"
                        />
                      ) : (
                        <DocumentDuplicateIcon
                          className="ml-1.5 text-xl font-normal text-sky-600 h-8 w-8 cursor-pointer"
                          aria-hidden="true"
                        />
                      )}
                    </CopyToClipboard>
                  </div>
                </div>
                <div className="overflow-auto bg-secondary rounded-3xl flex items-center">
                  <pre className="text-xs p-4">{displayTxResult(allBuilderAddress)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BGBuilders;
