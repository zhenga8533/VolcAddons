package com.volca.VolcAddons;

import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipArchiveInputStream;
import org.apache.commons.io.IOUtils;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.fml.common.Mod.EventHandler;
import net.minecraftforge.fml.common.event.FMLPreInitializationEvent;
import net.minecraftforge.fml.common.eventhandler.SubscribeEvent;
import net.minecraftforge.fml.common.gameevent.PlayerEvent;
import net.minecraftforge.fml.common.network.FMLNetworkEvent;
import net.minecraftforge.fml.common.registry.GameRegistry;
import net.minecraftforge.fml.common.FMLCommonHandler;
import net.minecraft.util.ChatComponentText;
import net.minecraft.entity.player.EntityPlayer;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

@Mod(modid = VolcAddons.MODID, version = VolcAddons.VERSION, clientSideOnly = true)
public class VolcAddons {
    public static final String MODID = "volcaddons";
    public static final String VERSION = "1.0";

    private static final String UPDATE_CHECK_URL = "https://api.github.com/repos/zhenga8533/VolcAddons/releases/latest";
    private boolean hasDownloadedUpdate = false;

    @EventHandler
    public void preInit(FMLPreInitializationEvent event) {
        FMLCommonHandler.instance().bus().register(this);
    }

    @SubscribeEvent
    public void onPlayerLogin(PlayerEvent.PlayerLoggedInEvent event) {
        if (!hasDownloadedUpdate) {
            checkForUpdates(event.player);
            hasDownloadedUpdate = true;
        }
    }

    private void checkForUpdates(EntityPlayer player) {
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

                String jsonResponse = response.toString();
                String downloadUrl = jsonResponse.split("\"browser_download_url\":\"")[1].split("\"")[0];

                if (!downloadUrl.isEmpty()) {
                    String minecraftDir = System.getProperty("user.home") + File.separator + "AppData" +
                            File.separator + "Roaming" + File.separator + ".minecraft";
                    File modulesDir = new File(minecraftDir + File.separator + "config" + File.separator +
                            "ChatTriggers" + File.separator + "modules");
                    modulesDir.mkdirs();

                    URL fileUrl = new URL(downloadUrl);
                    String fileName = fileUrl.getFile().substring(fileUrl.getFile().lastIndexOf('/') + 1);

                    File zipFile = new File(modulesDir, fileName);

                    // Download the zip file
                    InputStream inputStream = null;
                    FileOutputStream outputStream = null;
                    try {
                        inputStream = fileUrl.openStream();
                        outputStream = new FileOutputStream(zipFile);
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = inputStream.read(buffer)) != -1) {
                            outputStream.write(buffer, 0, bytesRead);
                        }
                    } finally {
                        if (inputStream != null) {
                            inputStream.close();
                        }
                        if (outputStream != null) {
                            outputStream.close();
                        }
                    }

                    extractZipFile(zipFile, modulesDir);

                    zipFile.delete(); // Clean up the zip file

                    player.addChatMessage(new ChatComponentText("New update downloaded and extracted to ChatTriggers/modules."));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void extractZipFile(File zipFile, File destinationDir) throws IOException {
        FileInputStream fis = null;
        ZipArchiveInputStream zipStream = null;
        try {
            fis = new FileInputStream(zipFile);
            zipStream = new ZipArchiveInputStream(fis);
            ZipArchiveEntry entry;
            while ((entry = zipStream.getNextZipEntry()) != null) {
                File entryFile = new File(destinationDir, entry.getName());

                if (entry.isDirectory()) {
                    entryFile.mkdirs();
                } else {
                    FileOutputStream outputStream = null;
                    try {
                        outputStream = new FileOutputStream(entryFile);
                        byte[] buffer = new byte[1024];
                        int bytesRead;
                        while ((bytesRead = zipStream.read(buffer)) != -1) {
                            outputStream.write(buffer, 0, bytesRead);
                        }
                    } finally {
                        if (outputStream != null) {
                            outputStream.close();
                        }
                    }
                }
            }
        } finally {
            if (zipStream != null) {
                zipStream.close();
            }
            if (fis != null) {
                fis.close();
            }
        }
    }
}
