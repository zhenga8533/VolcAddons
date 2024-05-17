/**
 * PacketBuffer fields:
    markReaderIndex
    getByte
    release
    func_179258_d
    func_150793_b
    writeZero
    resetReaderIndex
    writeFloat
    slice
    readInt
    unsignedShort
    order
    writeMedium
    resetWriterIndex
    writableBytes
    byte
    double
    func_150789_c
    getUnsignedShort
    maxCapacity
    index
    bytesBefore
    nioBufferCount
    setInt
    getInt
    func_179250_a
    markWriterIndex
    isReadable
    func_180714_a
    writeBoolean
    func_179254_b
    wait
    func_179253_g
    retain
    direct
    isWritable
    readChar
    notify
    long
    capacity
    hasMemoryAddress
    writable
    readDouble
    readFloat
    getBoolean
    copy
    readUnsignedMedium
    func_179260_f
    writeInt
    ensureWritable
    hasArray
    memoryAddress
    func_150786_a
    readableBytes
    readSlice
    forEachByteDesc
    nioBuffers
    skipBytes
    getLong
    readLong
    readShort
    equals
    char
    readBytes
    getUnsignedMedium
    setZero
    toString
    readBoolean
    func_179257_a
    isDirect
    setMedium
    setBoolean
    getClass
    readerIndex
    func_150791_c
    setShort
    compareTo
    float
    getBytes
    unwrap
    setChar
    setDouble
    zero
    refCnt
    unsignedByte
    getUnsignedInt
    indexOf
    readable
    writeByte
    func_179249_a
    nioBuffer
    discardSomeReadBytes
    func_150787_b
    duplicate
    writerIndex
    readUnsignedInt
    getChar
    setLong
    writeBytes
    readMedium
    forEachByte
    setIndex
    writeShort
    func_179252_a
    alloc
    readUnsignedShort
    getMedium
    func_179256_a
    setByte
    maxWritableBytes
    func_150792_a
    func_179259_c
    notifyAll
    getDouble
    getFloat
    medium
    writeLong
    array
    hashCode
    internalNioBuffer
    arrayOffset
    readUnsignedByte
    class
    writeDouble
    setBytes
    setFloat
    getShort
    clear
    unsignedMedium
    func_150788_a
    getUnsignedByte
    discardReadBytes
    int
    writeChar
    boolean
    bytes
    unsignedInt
    short
    func_179251_a
    readByte
    func_179255_a
 */

const UUID = Java.type('java.util.UUID');

/**
 * DOES NOT WORK! Prob reading stuff in the wrong order but I cba to fix it
 * -2 hours of life wasted
 * 
 * @param {*} buffer 
 * @returns 
 */
function readPartyInfoPacket(buffer) {
    const version = buffer.func_150792_a();
    const isParty = buffer.readBoolean();

    let leaderUuid = null;
    let memberCount = 0;
    let memberUuids = [];

    if (isParty) {
        const leaderUuidMost = buffer.readLong();
        const leaderUuidLeast = buffer.readLong();
        leaderUuid = new UUID(leaderUuidMost, leaderUuidLeast);

        memberCount = buffer.func_150792_a();

        for (let i = 0; i < memberCount; i++) {
            if (buffer.readableBytes() < 16) {
                break;
            }

            const memberUuidMost = buffer.readLong();
            const memberUuidLeast = buffer.readLong();
            const memberUuid = new UUID(memberUuidMost, memberUuidLeast);
            memberUuids.push(memberUuid);
        }
    }

    return {
        version,
        isParty,
        leaderUuid,
        memberCount,
        memberUuids
    };
}

class Hypixel {
    constructor() {
        const C17PacketCustomPayload = net.minecraft.network.play.client.C17PacketCustomPayload;
        const PacketBuffer = net.minecraft.network.PacketBuffer;
        const Unpooled = Java.type('io.netty.buffer.Unpooled');
        const piPacket = new C17PacketCustomPayload("hypixel:party_info", new PacketBuffer(Unpooled.buffer(1).writeByte(1)));
        
        register("command", () => {
            Client.sendPacket(piPacket);
        }).setName("test");

        register('packetReceived', packet => {
            ChatLib.chat(packet.func_149169_c());

            const buffer = packet.func_180735_b();
            const data = readPartyInfoPacket(buffer);
            ChatLib.chat(data.leaderUuid);
        }).setFilteredClass(net.minecraft.network.play.server.S3FPacketCustomPayload);
    }
}
export default new Hypixel();
