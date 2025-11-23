// lib/schema.ts
export const chatSchema =
  "uint64 timestamp, bytes32 roomId, string content, string senderName, address sender";

export const customRoomSchema =
  "uint64 timestamp, string roomId, bool isOpen, uint256 entry_fee";
export const winnerSchema = "uint64 timestamp, string roomId, address winner";
export const leaderboardSchema = "address player, uint256 wins, uint256 season";
export const seasonSchema = "uint256 seasons";
