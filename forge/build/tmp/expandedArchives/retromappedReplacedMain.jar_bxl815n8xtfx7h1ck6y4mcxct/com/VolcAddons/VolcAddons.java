package com.VolcAddons;

import net.minecraft.command.ICommandSender;
import net.minecraft.util.ChatComponentText;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.Mod.EventHandler;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraftforge.fml.common.gameevent.PlayerEvent;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@Mod(modid = "volcaddons", version = VolcAddons.VERSION, clientSideOnly = true)
public class VolcAddons {
    public static final String MODID = "volcaddons";
    public static final String VERSION = "1.0";

    private static final String UPDATE_CHECK_URL = "https://api.github.com/repos/zhenga8533/VolcAddons/releases/latest";

    @EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        MinecraftForge.EVENT_BUS.register(this);
    }

    @SubscribeEvent
    public void onPlayerLogin(PlayerEvent.PlayerLoggedInEvent event) {
        checkForUpdates(event.player);
        testMethod();
    }

    private void checkForUpdates(ICommandSender sender) {
        try {
            URL url = new URL(UPDATE_CHECK_URL);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.connect();

            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String line;
                StringBuilder response = new StringBuilder();

                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }

                reader.close();
                connection.disconnect();

                // Parse JSON response and extract release version and download URL
                String jsonResponse = response.toString();
                String latestVersion = jsonResponse.split("\"tag_name\":\"")[1].split("\"")[0];

                // Compare release version with current mod version
                if (!latestVersion.equals(VERSION)) {
                    sender.func_145747_a(new ChatComponentText("A new update is available!"));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Simple test method that references the com.VolcAddons class
    public static void testMethod() {
        System.out.println("This is a test method from the com.VolcAddons class.");
    }
}
