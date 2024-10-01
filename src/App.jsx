import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import useSound from "use-sound"; // 您需要安装这个包：npm install use-sound

// 假设您已经有这些音效文件
import spinSound from "./sounds/spin.wav";
import winSound from "./sounds/win.mp3";

// 新增 Modal 组件
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <Card className="w-[90%] max-w-[500px] bg-[#0a52a0] shadow-2xl rounded-3xl border-4 border-[#ecdc91]">
        <CardContent className="p-6">
          {children}
          <Button
            onClick={onClose}
            className="mt-6 w-full bg-gradient-to-r from-[#ecdc91] to-[#ffb600] hover:opacity-90 text-[#0a52a0] font-bold py-2 px-4 rounded-full text-lg"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
const Reel = ({ spinning, stopSymbol }) => {
  const symbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const [position, setPosition] = useState(
    Math.floor(Math.random() * symbols.length)
  );

  useEffect(() => {
    let interval;
    if (spinning) {
      interval = setInterval(() => {
        setPosition(Math.floor(Math.random() * symbols.length));
      }, 100);
    } else if (stopSymbol !== null) {
      setPosition(symbols.indexOf(stopSymbol));
    }
    return () => clearInterval(interval);
  }, [spinning, stopSymbol, symbols]);

  return (
    <div className="reel overflow-hidden h-24 w-16 bg-[#0a52a0] border-2 border-[#ecdc91] flex items-center justify-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#ecdc91] via-[#fff4c1] to-[#ffb600]">
      {symbols[position]}
    </div>
  );
};

const SlotMachine = React.forwardRef(({ onComplete }, ref) => {
  const [spinning, setSpinning] = useState(false);
  const [stopSymbols, setStopSymbols] = useState(Array(6).fill(null));

  const spin = useCallback(
    (result) => {
      setSpinning(true);
      setStopSymbols(Array(6).fill(null));

      setTimeout(() => {
        setSpinning(false);
        setStopSymbols(result);
        onComplete(result.join(""));
      }, 5000);
    },
    [onComplete]
  );

  React.useImperativeHandle(ref, () => ({
    spin,
  }));

  return (
    <div className="flex justify-center space-x-2 mb-4 bg-[#0a52a0] p-6 rounded-lg shadow-inner border-4 border-[#ecdc91]">
      {stopSymbols.map((symbol, index) => (
        <Reel key={index} spinning={spinning} stopSymbol={symbol} />
      ))}
    </div>
  );
});

const FileUpload = ({ onFileUpload }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        const accountList = content
          .split("\n")
          .slice(1)
          .reduce((acc, line) => {
            const [username, ticket] = line.trim().split(",");
            if (!acc[username]) {
              acc[username] = [];
            }
            acc[username].push(ticket);
            return acc;
          }, {});
        onFileUpload(accountList);
      };
      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="mb-4">
      <label className="block text-[#ecdc91] mb-2">
        Upload Account List (CSV):
      </label>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />
      <Button
        onClick={handleButtonClick}
        className="w-full bg-gradient-to-r from-[#ecdc91] to-[#ffb600] hover:opacity-90 text-[#0a52a0] font-bold py-2 px-4 rounded"
      >
        Choose File
      </Button>
      <p className="mt-2 text-[#ecdc91] text-sm">
        {fileInputRef.current?.files[0]?.name || "No file chosen"}
      </p>
    </div>
  );
};

const FancyTable = ({ data, columns, title }) => (
  <div className="mb-4 bg-[#0a52a0] rounded-lg shadow overflow-hidden">
    <h3 className="font-bold text-lg text-[#ecdc91] p-4 bg-[#094682] sticky top-0 z-10">
      {title}
    </h3>
    <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
      <table className="w-full">
        <thead className="sticky top-0 z-10">
          <tr className="bg-[#0d3d6e]">
            {columns.map((column, index) => (
              <th key={index} className="px-4 py-2 text-left text-[#fff4c1]">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-[#0a4a91]" : "bg-[#0a52a0]"}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className="px-4 py-2 text-[#ecdc91] border-t border-[#094682]"
                >
                  {row[column.toLowerCase()]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AccountList = ({ accounts }) => {
  const data = Object.entries(accounts).flatMap(([username, tickets]) =>
    tickets.map((ticket) => ({ username, ticket }))
  );

  return (
    <FancyTable
      data={data}
      columns={["Username", "Ticket"]}
      title="Account List"
    />
  );
};

const WinnersList = ({ winners }) => (
  <FancyTable
    data={winners}
    columns={["Username", "Ticket"]}
    title="Winners List"
  />
);


const App = () => {
  const [accountList, setAccountList] = useState({});
  const [winners, setWinners] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWinner, setCurrentWinner] = useState(null);
  const slotMachineRef = useRef(null);

  const [playSpinSound, { stop: stopSpinSound }] = useSound(spinSound, {
    loop: true,
  });
  const [playWinSound] = useSound(winSound);

  const handleSpin = useCallback(() => {
    if (Object.keys(accountList).length === 0) {
      alert("Please upload the account list first");
      return;
    }

    const allTickets = Object.entries(accountList).flatMap(
      ([username, tickets]) =>
        tickets.map((ticket) => ({ username, ticket }))
    );

    const remainingTickets = allTickets.filter(
      (ticket) =>
        !winners.some((winner) => winner.ticket === ticket.ticket)
    );

    if (remainingTickets.length === 0) {
      alert("All tickets have been drawn!");
      return;
    }

    setSpinning(true);
    playSpinSound();

    const randomIndex = Math.floor(Math.random() * remainingTickets.length);
    const winner = remainingTickets[randomIndex];
    const newNumbers = winner.ticket.slice(-6).split(""); // 修改这里以使用最后6位数字

    if (slotMachineRef.current) {
      slotMachineRef.current.spin(newNumbers);
    }
  }, [accountList, winners, playSpinSound]);

  const handleSpinComplete = useCallback(
    (result) => {
      setSpinning(false);
      stopSpinSound();
      const winner = Object.entries(accountList)
        .flatMap(([username, tickets]) =>
          tickets.map((ticket) => ({ username, ticket }))
        )
        .find((ticket) => ticket.ticket.endsWith(result));

      if (winner) {
        setWinners((prev) => [...prev, winner]);
        setCurrentWinner(winner);
        setIsModalOpen(true);
        playWinSound();
      }
    },
    [accountList, playWinSound, stopSpinSound]
  );

  const handleFileUpload = useCallback((newAccountList) => {
    setAccountList(newAccountList);
    setWinners([]);
    alert("Account list uploaded successfully");
  }, []);

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-[#0a52a0] p-4 md:p-8 font-[-apple-system,BlinkMacSystemFont,Helvetica_Neue,Arial,PingFang_SC,Microsoft_YaHei,sans-serif] relative">
      {/* Background watermark */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain opacity-10"
        style={{ backgroundImage: "url('/background.jpeg')" }}
      ></div>

      <img
        src="/logo.jpeg"
        alt="Law in Play Logo"
        className="mb-6 w-48 md:w-64 relative z-10"
      />
      <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 relative z-10 w-full max-w-7xl">
        <Card className="flex-1 bg-[#0a52a0] shadow-2xl rounded-3xl border-4 border-[#ecdc91]">
          <CardContent className="p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-b from-[#ecdc91] via-[#fff4c1] to-[#ffb600]">
              Lucky Draw Machine
            </h1>
            <SlotMachine ref={slotMachineRef} onComplete={handleSpinComplete} />
            <Button
              onClick={handleSpin}
              className="w-full mb-4 bg-gradient-to-b from-[#ecdc91] via-[#fff4c1] to-[#ffb600] hover:opacity-90 text-[#0a52a0] font-bold py-3 md:py-4 text-xl md:text-2xl rounded-full shadow-lg transform hover:scale-105 transition-all"
              disabled={spinning}
            >
              {spinning ? "Drawing..." : "Start Draw"}
            </Button>
            <FileUpload onFileUpload={handleFileUpload} />
            <WinnersList winners={winners} />
          </CardContent>
        </Card>
        <Card className="lg:w-[500px] bg-[#0a52a0] shadow-xl rounded-3xl border-4 border-[#ecdc91]">
          <CardContent className="p-4 md:p-6">
            <AccountList accounts={accountList} />
          </CardContent>
        </Card>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-3xl font-bold mb-6 text-center text-[#ecdc91]">
          Congratulations!
        </h2>
        <div className="bg-[#094682] p-4 rounded-lg mb-4">
          <p className="text-[#fff4c1] text-xl mb-2">
            <span className="font-semibold">Winner:</span>
          </p>
          <p className="text-[#ecdc91] text-3xl font-bold mb-4">
            {currentWinner?.username}
          </p>
          <p className="text-[#fff4c1] text-xl mb-2">
            <span className="font-semibold">Ticket Number:</span>
          </p>
          <p className="text-[#ecdc91] text-3xl font-bold">
            {currentWinner?.ticket}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default App;