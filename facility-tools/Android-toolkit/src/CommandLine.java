import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class CommandLine {
    public static void run(String command) throws InterruptedException, IOException {
        System.out.println("running: "+command);
        final Process p = Runtime.getRuntime().exec(command);

        new Thread(new Runnable() {
            public void run() {
                BufferedReader input = new BufferedReader(new InputStreamReader(p.getInputStream()));
                String line = null;

                try {
                    while ((line = input.readLine()) != null)
                        System.out.println(line);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }).start();

        p.waitFor();
    }
}
