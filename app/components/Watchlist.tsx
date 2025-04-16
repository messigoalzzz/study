import { Input, message, Modal } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { SearchOutlined } from "@ant-design/icons";
import {
  postAiTradingSymbollist,
  postAiTradingWatchlist,
  postAddAiTradingWatchlist,
  postRemoveAiTradingWatchlist,
} from "@/lib/fetcher";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

interface IWatchlist {
  agentId:string
  onWatchListChange?: (symbol: any) => void;
}

const Watchlist = ({ onWatchListChange ,agentId}: IWatchlist) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [marketData, setMarketData] = useState<Record<string, any>>({});
  const socketRef = useRef<Socket | null>(null);

  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);
  const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKETIO_URL;
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [list, setList] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredList, setFilteredList] = useState<any>([]);
  const [watchlist, setWatchlist] = useState<any>([]);
  const loadList = async () => {
    const { data, code } = await postAiTradingSymbollist({
      agentId,
    });
    setList(data);
    setFilteredList(data);
  };

  const loadWatchList = async () => {
    const { data, code } = await postAiTradingWatchlist({
      agentId,
      symbols: "",
    });
    setWatchlist(
      data.map((item) => ({
        ...item,
        symbol_name: item.symbol_name.replace("/", ""),
        symbol_name_label: item.symbol_name,
      }))
    );
  };

  // 初始化WebSocket连接
  const connectSocket = () => {
    // 断开之前的连接
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // 创建新的连接
    const socket = io(WEBSOCKET_URL, {
      transports: ["websocket"],
      path: "/socket.io/",
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 设置事件监听
    socket.on("connect", () => {
      setIsConnected(true);
      // console.log(`已连接，Socket ID: ${socket.id}`);
      // 连接成功后，如果已有watchlist数据，立即订阅
      if (watchlist.length > 0) {
        subscribeToSymbols();
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      // console.log("已断开连接");
    });

    socket.on("connect_error", (error) => {
      // console.log(`连接错误: ${error.message}`);
    });

    // 监听市场数据更新
    socket.on("symbol_update", (data) => {
      // console.log("收到市场数据:", data);
      setMarketData((prevData) => ({
        ...prevData,
        [data.symbol]: data,
      }));
    });

    socketRef.current = socket;
  };

  // 断开WebSocket连接
  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // 订阅符号
  const subscribeToSymbols = () => {
    if (!socketRef.current || !isConnected || watchlist.length === 0) return;

    // 为每个符号创建订阅
    watchlist.forEach((item) => {
      if (item.symbol_name) {
        // console.log(`订阅符号: ${item.symbol_name}`);
        socketRef.current?.emit("subscribe", item.symbol_name);
      }
    });
  };

  // 组件挂载时连接WebSocket，卸载时断开连接
  useEffect(() => {
    loadList();
    loadWatchList();
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  // 处理搜索功能
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setFilteredList(list);
      return;
    }

    const lowercasedValue = value.toLowerCase().trim();
    const filtered = list.filter((item: any) => {
      return (
        (item.symbol_short_name &&
          item.symbol_short_name.toLowerCase().includes(lowercasedValue)) ||
        (item.symbol_full_name &&
          item.symbol_full_name.toLowerCase().includes(lowercasedValue)) ||
        (item.exchange_name &&
          item.exchange_name.toLowerCase().includes(lowercasedValue))
      );
    });

    setFilteredList(filtered);
  };

  // 当Modal打开时重置搜索
  useEffect(() => {
    if (isModalOpen) {
      setSearchTerm("");
      setFilteredList(list);
    }
  }, [isModalOpen, list]);

  // 监听市场数据变化，用于调试
  useEffect(() => {
    if (Object.keys(marketData).length > 0) {
      // console.log("市场数据已更新:", marketData);
    }
  }, [marketData]);

  // console.log("---marketData-", marketData);

  // 当watchlist变化时，更新订阅
  useEffect(() => {
    if (isConnected && watchlist.length > 0) {
      subscribeToSymbols();
    }
  }, [watchlist, isConnected]);

  useEffect(() => {
    if (watchlist.length > 0) {
      handleWatchlist(watchlist[0]);
    } else {
      handleWatchlist({});
    }
  }, [watchlist]);

  const handleSymbolWatchlist = async (symbol: any) => {
    try {

      if(symbol.is_watched){
        await postRemoveAiTradingWatchlist({
          watchlistsId: symbol.watched_id,
          agentId: "a40b21fc-5e6f-0a9d-9839-438f13f30a95",
        });
      }else{
        await postAddAiTradingWatchlist({
          symbol_id: symbol.id,
          agentId: "a40b21fc-5e6f-0a9d-9839-438f13f30a95",
        });
  
      }

     
      // 更新本地状态，将is_watched切换为相反值
      setList((prevList) =>
        prevList.map((item) =>
          item.id === symbol.id
            ? { ...item, is_watched: !item.is_watched }
            : item
        )
      );

      // 根据操作类型显示不同的成功消息
      message.success(
        symbol.is_watched
          ? "Remove from watchlist success"
          : "Add to watchlist success"
      );

      // 如果需要，重新加载监视列表
      loadWatchList();
    } catch (error) {
      console.log("error", error);
      message.error("Failed to update watchlist");
    }
  };

  const handleWatchlist = (item: any) => {
    setActiveSymbol(item.symbol_name);
    onWatchListChange && onWatchListChange(item);
  };

  return (
    <>
      <div className="p-4 h-full overflow-y-auto bg-white/10 rounded-l-lg mb-6">
        <div className="flex items-center w-full justify-between">
          <h5 className="text-sm text-white font-semibold">Watchlist</h5>
          <img
            onClick={showModal}
            src="/image/add-watchlist.png"
            className="size-6 cursor-pointer"
            alt=""
          />
        </div>

        <div className="flex items-center gap-5 px-2 mt-4">
          <span className="text-white/40 text-sm font-normal flex-[1_1_120px] overflow-x-auto">
            Symbol
          </span>
          <span className="text-white/40 text-sm font-normal flex-[1_1_60px] overflow-x-auto">
            Last
          </span>
          <span className="text-white/40 text-sm font-normal flex-[1_1_60px] overflow-x-auto">
            Chg
          </span>
          <span className="text-white/40 text-sm font-normal flex-[1_1_50px] text-right overflow-x-auto">
            Chg%
          </span>
        </div>

        <div className="flex flex-col overflow-y-auto h-[calc(100%-90px)] gap-10 mt-6 px-2">
          {watchlist.length > 0 ? (
            watchlist.map((item, index) => {
              // 获取该符号的实时市场数据，如果没有则使用默认值
              const symbolData = marketData[item.symbol_name] || {};
              const lastPrice = symbolData.lastPrice
                ? Number(symbolData.lastPrice).toFixed(4)
                : "-";
              const priceChange = symbolData.priceChangePercent || "-";
              const priceChangePercent = symbolData.priceChangePercent || 0;

              // 根据价格变化确定颜色
              const priceChangeColor =
                parseFloat(priceChange) >= 0
                  ? "text-[rgba(17,179,130,0.90)]"
                  : "text-[rgba(255,69,58,0.90)]";

              return (
                <div
                  onClick={() => {
                    handleWatchlist(item);
                  }}
                  key={index}
                  className={`flex items-center gap-5 px-2 cursor-pointer hover:bg-white/5 py-2 rounded-md border ${
                    activeSymbol === item.symbol_name
                      ? "border-white/5"
                      : "border-transparent"
                  }`}
                >
                  <div className="text-white flex flex-row gap-2 text-sm font-semibold flex-[1_1_120px] overflow-x-auto">
                    <img
                      className="size-[18px]"
                      src={item.symbol_icon}
                      alt=""
                    />
                    <div className="bg-white/5 rounded text-xs px-[6px] py-[1.5px]">
                      {item.symbol_name_label}
                    </div>
                  </div>
                  <span className="text-white text-sm font-semibold flex-[1_1_60px] overflow-x-auto">
                    {lastPrice}
                  </span>
                  <span
                    className={`${priceChangeColor} text-sm font-semibold flex-[1_1_60px] overflow-x-auto`}
                  >
                    {((priceChange * Number(lastPrice))/100).toFixed(4)}
                  </span>
                  <span
                    className={`text-sm font-semibold flex-[1_1_50px] text-right ${priceChangeColor} overflow-x-auto`}
                  >
                    {priceChangePercent}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <Image
                className="w-70"
                width={70}
                height={98}
                src="/image/nodata-dark.png"
                alt=""
              />
              <p className="text-base text-white mt-2">No Data</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Add symbol"
        width={920}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        rootClassName="add-symbol-modal"
      >
        <div>
          <Input
            placeholder="Search in Current List"
            prefix={
              <SearchOutlined
                className="size-6"
                style={{ color: "rgba(255, 255, 255, 0.40)" }}
              />
            }
            rootClassName="search-input h-10 w-full"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />

          <div className="mt-6 space-y-6 w-full">
            {filteredList.map((item, index) => (
              <div
                key={index}
                className="w-full flex items-center justify-between border-white/10 pb-4  border-b "
              >
                <div className="inline-flex gap-2">
                  <img src={item.symbol_icon} className="size-6" alt="" />
                  <span>{item.symbol_short_name}</span>
                </div>
                <span className="text-sm text-white font-normal">
                  {item.symbol_full_name}
                </span>
                <div className="inline-flex gap-2">
                  {/* <span className="text-sm text-white/55">spot crypto</span> */}
                  <div className="inline-flex gap-2">
                    <span>{item.exchange_name}</span>
                    {/* <img src={item.exchange_icon} className="size-6" alt="" /> */}
                  </div>

                  <img
                    onClick={() => handleSymbolWatchlist(item)}
                    src={
                      item.is_watched
                        ? "/image/trading/delete.svg"
                        : "/image/trading/add.svg"
                    }
                    className="size-5 cursor-pointer"
                    alt=""
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Watchlist;
