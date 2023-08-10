import { useEffect, useState } from "react";
import type { NextPage } from "next";
import CopyToClipboard from "react-copy-to-clipboard";
import * as XLSX from "xlsx";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Spinner } from "~~/components/Spinner";
import { displayTxResult } from "~~/components/scaffold-eth";

const challenges_id = [
  "decentralized-staking",
  "dice-game",
  "simple-nft-example",
  "token-vendor",
  "minimum-viable-exchange",
  "state-channels",
] as const;

type CHALLENGE_DATA = {
  autoGrading: boolean;
  contractUrl: string;
  deployedUrl: string;
  reviewComment: string;
  submittedTimeStamp: number;
  status: "ACCEPTED" | "PENDING" | "REJECTED";
};

type BUILDER_DATA = {
  challenges?: {
    [key in (typeof challenges_id)[number]]?: CHALLENGE_DATA;
  };
  creationTimestamp: number;
  id: string;
};

const Home: NextPage = () => {
  // const [builderWithStakingChallengeAccepted, setBuilderWithStakingChallengeAccepted] = useState<BUILDER_DATA[]>([]);
  const [addressCopied, setAddressCopied] = useState(false);
  const [acceptedBuilderAddress, setAcceptedBuildersAdderess] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] =
    useState<(typeof challenges_id)[number]>("decentralized-staking");

  useEffect(() => {
    const API_URL = "https://scaffold-directory-dev.ew.r.appspot.com/builders";

    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = (await res.json()) as BUILDER_DATA[];
      console.log("DATA", data);
      const buildersWithStakingChallengeAccepted = data.filter(
        builder => builder.challenges?.[selectedChallengeId]?.status === "ACCEPTED",
      );
      // setBuilderWithStakingChallengeAccepted(buildersWithStakingChallengeAccepted);
      setAcceptedBuildersAdderess(buildersWithStakingChallengeAccepted.map(builder => builder.id));
      setLoading(false);
    };

    fetchData();
  }, [selectedChallengeId]);

  const handleDownloadExcel = () => {
    const dataToExport = acceptedBuilderAddress.map((address, index) => ({
      BuilderIndex: index + 1,
      BuilderAddress: address,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Builders");

    XLSX.writeFile(wb, "accepted_builders.xlsx");
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
        {/*Use a daisUI select to render all challenges_id*/}
        <select
          className="select select-bordered w-64 mb-8"
          value={selectedChallengeId}
          onChange={e => setSelectedChallengeId(e.target.value as (typeof challenges_id)[number])}
        >
          {challenges_id.map(challenge_id => (
            <option key={challenge_id} value={challenge_id}>
              {challenge_id}
            </option>
          ))}
        </select>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          {/*Render Builders list*/}
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-center text-2xl mb-8">Builders {acceptedBuilderAddress.length}</h2>
            {loading ? (
              <Spinner width="75" height="75" />
            ) : (
              <div className="grid w-3/4">
                <div>
                  {addressCopied ? (
                    <CheckCircleIcon
                      className="ml-1.5 text-xl font-normal text-sky-600 h-12 w-12 cursor-pointer"
                      aria-hidden="true"
                    />
                  ) : (
                    <>
                      <div className="mt-4 mb-8">
                        <button className="btn btn-primary" onClick={handleDownloadExcel}>
                          Download Excel
                        </button>
                      </div>
                      <CopyToClipboard
                        text={JSON.stringify(acceptedBuilderAddress)}
                        onCopy={() => {
                          setAddressCopied(true);
                          setTimeout(() => {
                            setAddressCopied(false);
                          }, 800);
                        }}
                      >
                        <DocumentDuplicateIcon
                          className="ml-1.5 text-xl font-normal text-sky-600 h-12 w-12 cursor-pointer"
                          aria-hidden="true"
                        />
                      </CopyToClipboard>
                    </>
                  )}
                  <div className="overflow-auto bg-secondary rounded-t-none rounded-3xl">
                    <pre className="text-xs pt-4">{displayTxResult(acceptedBuilderAddress)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
