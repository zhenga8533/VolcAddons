package com.volca.VolcAddons;

import net.minecraft.command.CommandBase;
import net.minecraft.command.ICommandSender;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.util.ChatComponentText;
import net.minecraft.util.EnumChatFormatting;

public class CommandUpdateVA extends CommandBase {
    @Override
    public String getCommandName() {
        return "updateva"; // Command name
    }

    @Override
    public String getCommandUsage(ICommandSender sender) {
        return "/updateva"; // Command usage
    }

    @Override
    public boolean canCommandSenderUseCommand(ICommandSender sender) {
        return true; // Allow any command sender to use this command
    }

    @Override
    public void processCommand(ICommandSender sender, String[] args) {
        if (sender instanceof EntityPlayer) {
            EntityPlayer player = (EntityPlayer) sender;
            player.addChatMessage(new ChatComponentText(EnumChatFormatting.RED + "Updating VolcAddons..."));
            VolcAddons.INSTANCE.downloadAndExtractUpdate(player); // Call the update method from VolcAddons class
        }
    }
}
