package com.volca.VolcAddons;

import net.minecraft.command.CommandBase;
import net.minecraft.command.ICommandSender;
import net.minecraft.entity.player.EntityPlayer;
import net.minecraft.util.ChatComponentText;
import net.minecraft.util.EnumChatFormatting;

public class CommandUpdateVA extends CommandBase {
    @Override
    public String func_71517_b() {
        return "updateva"; // Command name
    }

    @Override
    public String func_71518_a(ICommandSender sender) {
        return "/updateva"; // Command usage
    }

    @Override
    public boolean func_71519_b(ICommandSender sender) {
        return true; // Allow any command sender to use this command
    }

    @Override
    public void func_71515_b(ICommandSender sender, String[] args) {
        if (sender instanceof EntityPlayer) {
            EntityPlayer player = (EntityPlayer) sender;
            player.func_145747_a(new ChatComponentText(EnumChatFormatting.RED + "Updating VolcAddons..."));
            VolcAddons.INSTANCE.downloadAndExtractUpdate(player); // Call the update method from VolcAddons class
        }
    }
}
